import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/db/userRepository";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: { message: "Verification token is missing" } },
                { status: 400 }
            );
        }

        // 1. Find user by token
        const user = await userRepository.findByVerificationToken(token);

        if (!user) {
            return NextResponse.json(
                { error: { message: "Invalid or expired verification token" } },
                { status: 400 }
            );
        }

        // 2. Verify user
        await userRepository.verifyUser(user.id);

        return NextResponse.json(
            { message: "Email verified successfully. You can now log in." },
            { status: 200 }
        );
    } catch (error) {
        console.error("AuthVerifyRoute:", error);
        return NextResponse.json(
            { error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}
