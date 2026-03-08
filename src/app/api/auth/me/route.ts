import { NextResponse } from "next/server";
import { userRepository } from "@/lib/db/userRepository";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: { message: "Not authenticated" } },
                { status: 401 }
            );
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, jwtSecret) as { userId: string };

            // We don't have a findById in our mock right now, let's just find manually or we can add it later
            // The fastest way with our mock is to re-implement findById here or add to repo.
            // Wait, we can quickly search all users OR let's add findById to repository in a separate patch. 
            // For now, let's do a hack since it's mock:
            // We will need to export all users or add findById. Since we can't do that inline easily, 
            // we'll cast the repository to any for a moment to access private users array. 
            // A better way is to update `userRepository.ts` next to add `findById`.
            // Let's assume we will add `findById` to `userRepository`.

            const user = await userRepository.findById(decoded.userId);

            if (!user) {
                return NextResponse.json(
                    { error: { message: "User not found" } },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { user: { id: user.id, name: user.name, email: user.email, isVerified: user.isVerified } },
                { status: 200 }
            );
        } catch (_error) {
            return NextResponse.json(
                { error: { message: "Invalid or expired token" } },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("AuthMeRoute:", error);
        return NextResponse.json(
            { error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("auth_token");
        return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    } catch (error) {
        console.error("AuthLogoutRoute:", error);
        return NextResponse.json(
            { error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}
