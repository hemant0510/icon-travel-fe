import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName:  z.string().min(1, "Last name is required").max(100),
  email:     z.string().email("Invalid email address"),
  phone:     z.string().min(7, "Phone number too short").max(20).regex(/^\+?[\d\s\-()+]+$/, "Invalid phone number"),
  password:  z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
