import crypto from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db";
import { emailVerificationTokens } from "@/db/schema";

const TOKEN_EXPIRY_HOURS = 24;

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex"); // 64-char hex string
}

export async function createVerificationToken(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Delete any existing tokens for this user before creating a new one
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.userId, userId));

  await db.insert(emailVerificationTokens).values({ userId, token, expiresAt });

  return token;
}

export async function consumeVerificationToken(
  token: string
): Promise<string | null> {
  const [row] = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.token, token),
        gt(emailVerificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!row) return null;

  // Delete token so it can only be used once
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.id, row.id));

  return row.userId;
}
