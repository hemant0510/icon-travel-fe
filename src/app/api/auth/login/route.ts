import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/db/userRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { cookies } from "next/headers";

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Validate input
        const validatedData = loginSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json(
                { error: { message: "Invalid input data", details: validatedData.error.errors } },
                { status: 400 }
            );
        }

        const { email, password } = validatedData.data;

        // 2. Check if user exists
        const user = await userRepository.findByEmail(email);
        if (!user) {
            return NextResponse.json(
                { error: { message: "Invalid credentials" } },
                { status: 401 }
            );
        }

        // 3. Check if password matches
        if (!user.password) {
            return NextResponse.json(
                { error: { message: "Invalid login method for this user" } },
                { status: 401 }
            );
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json(
                { error: { message: "Invalid credentials" } },
                { status: 401 }
            );
        }

        // 4. Check if verified
        if (!user.isVerified) {
            return NextResponse.json(
                { error: { message: "Please verify your email before logging in" } },
                { status: 403 }
            );
        }

        // 5. Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";
        const token = jwt.sign(
            { userId: user.id },
            jwtSecret,
            { expiresIn: "7d" } // Token valid for 7 days
        );

        // 6. Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: "/",
        });

        return NextResponse.json(
            {
                message: "Login successful",
                user: { id: user.id, name: user.name, email: user.email }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("AuthLoginRoute:", error);
        return NextResponse.json(
            { error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}
