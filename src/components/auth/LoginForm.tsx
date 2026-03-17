"use client";

import { useActionState, useEffect } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "@/app/actions/authActions";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthActionState } from "@/types/auth";
import ResendVerification from "./ResendVerification";

const initialState: AuthActionState = { status: "idle" };

export default function LoginForm() {
  const setUser        = useAuthStore((s) => s.setUser);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);

  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.status === "success" && state.user) {
      setUser(state.user);
      closeAuthModal();
    }
  }, [state, setUser, closeAuthModal]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" && state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <p>{state.error}</p>
          {state.unverifiedEmail && (
            <div className="mt-2 pt-2 border-t border-red-200">
              <ResendVerification email={state.unverifiedEmail} />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-medium text-text-primary">
          Email address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="glass-input px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:glass-input-focus outline-none w-full"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="text-sm font-medium text-text-primary">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="glass-input px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:glass-input-focus outline-none w-full"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="gradient-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <LogIn size={16} />
        {isPending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
