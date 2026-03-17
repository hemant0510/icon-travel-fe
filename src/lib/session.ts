import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/types/auth";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = "if_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    sub:       user.id,
    email:     user.email,
    firstName: user.firstName,
    lastName:  user.lastName,
    phone:     user.phone,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id:        payload.sub as string,
      email:     payload.email as string,
      firstName: payload.firstName as string,
      lastName:  payload.lastName as string,
      phone:     payload.phone as string,
    };
  } catch {
    return null;
  }
}

export const COOKIE_OPTIONS = {
  name:     COOKIE_NAME,
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
  maxAge:   MAX_AGE,
};
