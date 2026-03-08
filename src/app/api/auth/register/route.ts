import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/db/userRepository";
import { sendVerificationEmail } from "@/lib/utils/mailer";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Validate input
        const validatedData = registerSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json(
                { error: { message: "Invalid input data", details: validatedData.error.errors } },
                { status: 400 }
            );
        }

        const { name, email, password } = validatedData.data;

        // 2. Check if user exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: { message: "User with this email already exists" } },
                { status: 400 }
            );
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Generate token
        const verificationToken = crypto.randomUUID();

        // 5. Create user (isVerified will be false initially)
        const newUser = await userRepository.create({
            name,
            email,
            password: hashedPassword,
            verificationToken,
        });

        // 6. Send Email asynchronously
        try {
            await sendVerificationEmail(email, verificationToken, name);
        } catch (emailError) {
            console.error("Registration created user but failed to send email:", emailError);
            // We still return 201 because user was created, but they might need to resend email later
        }

        return NextResponse.json(
            {
                message: "Registration successful. Please check your email to verify your account.",
                // Do not return password or sensitive token in standard API responses
                user: { id: newUser.id, name: newUser.name, email: newUser.email }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("AuthRegistrationRoute:", error);
        return NextResponse.json(
            { error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}
