import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { consumeVerificationToken } from "@/lib/verificationToken";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?error=missing_token", request.url));
  }

  try {
    const userId = await consumeVerificationToken(token);

    if (!userId) {
      return NextResponse.redirect(new URL("/verify-email?error=invalid_or_expired", request.url));
    }

    await db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return NextResponse.redirect(new URL("/verify-email?success=true", request.url));
  } catch (error) {
    console.error("VerifyEmail route:", error);
    return NextResponse.redirect(new URL("/verify-email?error=server_error", request.url));
  }
}
