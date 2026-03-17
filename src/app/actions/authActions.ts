"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { signToken, COOKIE_OPTIONS } from "@/lib/session";
import { registerSchema, loginSchema } from "@/lib/authSchemas";
import { createVerificationToken } from "@/lib/verificationToken";
import { sendVerificationEmail } from "@/lib/email";
import type { AuthActionState, SessionUser } from "@/types/auth";

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName:  String(formData.get("lastName")  ?? ""),
    email:     String(formData.get("email")     ?? ""),
    phone:     String(formData.get("phone")     ?? ""),
    password:  String(formData.get("password")  ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [field, errs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[field] = errs ?? [];
    }
    return { status: "error", error: "Please fix the errors below.", fieldErrors };
  }

  const { firstName, lastName, email, phone, password } = parsed.data;

  try {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return { status: "error", error: "An account with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db.insert(users).values({
      firstName,
      lastName,
      email,
      phone,
      password: passwordHash,
      emailVerified: false,
    }).returning();

    // Create and send verification email (non-blocking on error)
    try {
      const token = await createVerificationToken(newUser.id);
      await sendVerificationEmail(email, firstName, token);
    } catch (emailErr) {
      console.error("AuthActions register — email send failed:", emailErr);
      // Don't block registration if email fails; user can resend later
    }

    return { status: "verify_email", email };
  } catch (error) {
    console.error("AuthActions register:", error);
    return { status: "error", error: "Something went wrong. Please try again." };
  }
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    email:    String(formData.get("email")    ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", error: "Invalid email or password." };
  }

  const { email, password } = parsed.data;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { status: "error", error: "Invalid email or password." };
    }

    if (!user.emailVerified) {
      return {
        status: "error",
        error:  "Please verify your email before signing in. Check your inbox for the verification link.",
        unverifiedEmail: email,
      };
    }

    const sessionUser: SessionUser = {
      id:        user.id,
      email:     user.email,
      firstName: user.firstName,
      lastName:  user.lastName,
      phone:     user.phone,
    };

    const token = await signToken(sessionUser);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_OPTIONS.name, token, COOKIE_OPTIONS);

    return { status: "success", user: sessionUser };
  } catch (error) {
    console.error("AuthActions login:", error);
    return { status: "error", error: "Something went wrong. Please try again." };
  }
}

export async function resendVerificationEmailAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  if (!email) return { status: "error", error: "Email is required." };

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    // Always return success to avoid leaking whether email exists
    if (!user || user.emailVerified) {
      return { status: "verify_email", email };
    }

    const token = await createVerificationToken(user.id);
    await sendVerificationEmail(email, user.firstName, token);

    return { status: "verify_email", email };
  } catch (error) {
    console.error("AuthActions resend:", error);
    return { status: "error", error: "Failed to resend email. Please try again." };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_OPTIONS.name);
  redirect("/");
}
