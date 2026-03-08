"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import userAuthService from "@/services/userAuthService";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams?.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email address...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Verification token is missing. Please check the link in your email.");
            return;
        }

        const verify = async () => {
            try {
                const response = await userAuthService.verify(token);
                setStatus("success");
                setMessage(response.message || "Email verified successfully!");

                // Auto-redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } catch (err: any) {
                setStatus("error");
                setMessage(err.message || "Invalid or expired verification link.");
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-primary-500/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-accent-500/20 blur-[100px] pointer-events-none" />

            <div className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10 animate-fade-in-up text-center">

                {status === "loading" && (
                    <div className="py-8">
                        <Loader2 className="animate-spin text-primary-500 mx-auto mb-6" size={48} />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verifying Email</h2>
                        <p className="text-gray-500 dark:text-gray-400">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="py-6">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mb-6 border-4 border-green-100 shadow-sm">
                            <CheckCircle2 className="text-green-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Email Verified!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
                        <p className="text-sm text-gray-500 mb-8">Redirecting you to login...</p>
                        <Link
                            href="/login"
                            className="inline-flex w-full items-center justify-center gap-2 gradient-primary text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all"
                        >
                            Go to Login
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                )}

                {status === "error" && (
                    <div className="py-6">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-6 border-4 border-red-100 shadow-sm">
                            <XCircle className="text-red-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Verification Failed</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
                        <Link
                            href="/signup"
                            className="inline-flex w-full items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Return to Signup
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}
