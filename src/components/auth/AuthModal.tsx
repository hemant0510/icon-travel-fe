"use client";

import { useState } from "react";
import userAuthService from "@/services/userAuthService";
import { useAuthStore } from "@/store/useAuthStore";
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight, Plane, Loader2, CheckCircle2, X } from "lucide-react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const setUser = useAuthStore((state) => state.setUser);

    const [mode, setMode] = useState<"login" | "signup" | "success">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Password Validation
    const validatePassword = (pwd: string) => {
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return regex.test(pwd);
    };

    if (!isOpen) return null;

    const resetState = () => {
        setName("");
        setEmail("");
        setPassword("");
        setError(null);
        setShowPassword(false);
    };

    const handleToggleMode = () => {
        setMode(mode === "login" ? "signup" : "login");
        resetState();
    };

    const handleClose = () => {
        onClose();
        resetState();
        setTimeout(() => setMode("login"), 300); // Reset after animation
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === "signup" && !validatePassword(password)) {
            setError("Must be atleast 8 characters in length and should contain at least one alphabet, one number and one special character @$!%*#?&.");
            return;
        }

        setIsLoading(true);

        try {
            if (mode === "login") {
                const result = await userAuthService.login({ email, password });
                setUser(result.user);
                handleClose();
            } else {
                await userAuthService.register({ name, email, password });
                setMode("success");
            }
        } catch (err: any) {
            setError(err.message || `Failed to ${mode}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {mode === "success" ? (
                    <div className="p-8 pb-10 text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6 text-green-600">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Account created successfully!</h2>
                        <p className="text-gray-600 mb-8 max-w-[280px] mx-auto text-sm">
                            We've sent a verification link to <span className="font-semibold text-gray-900">{email}</span>.
                            Please check your inbox to verify your account.
                        </p>
                        <button
                            onClick={() => { setMode("login"); resetState(); }}
                            className="w-full flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white py-3.5 px-4 rounded-xl font-medium transition-colors"
                        >
                            Return to Login
                        </button>
                    </div>
                ) : (
                    <div className="p-8 pb-10 pt-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-600/20 mb-5">
                                <Plane className="text-white" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {mode === "login" ? "Welcome Back" : "Create an Account"}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {mode === "login" ? "Log in to Icon Fly to manage your bookings" : "Join Icon Fly to start booking your trips"}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-[13px] border border-red-100 leading-tight">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === "signup" && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1.5 pl-1">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <UserIcon size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1.5 pl-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none font-medium"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5 pl-1">
                                    <label className="block text-sm font-semibold text-gray-400">
                                        Password
                                    </label>
                                    {mode === "login" && (
                                        <button type="button" className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none font-medium text-lg tracking-wider"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {mode === "signup" && (
                                    <p className="mt-2 text-[11px] text-gray-400 pl-1 leading-snug">
                                        Must be atleast 8 characters in length and should contain at least one alphabet, one number and one special character @$!%*#?&.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3.5 px-4 rounded-xl font-semibold shadow-md shadow-primary-600/20 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        {mode === "login" ? "Sign In" : "Create Account"}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-medium text-gray-500">
                            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={handleToggleMode}
                                className="text-primary-600 hover:text-primary-700 font-bold transition-colors"
                            >
                                {mode === "login" ? "Sign up here" : "Sign in here"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
