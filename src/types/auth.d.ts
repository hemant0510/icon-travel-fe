export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  iat: number;
  exp: number;
}

export type AuthMode = "login" | "register";

export interface AuthActionState {
  status: "idle" | "success" | "error" | "verify_email";
  user?: SessionUser;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  email?: string;           // email that needs verification
  unverifiedEmail?: string; // set on login when email not verified yet
}
