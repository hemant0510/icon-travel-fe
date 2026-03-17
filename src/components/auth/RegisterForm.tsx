"use client";

import { useActionState } from "react";
import { UserPlus, Mail } from "lucide-react";
import { registerAction } from "@/app/actions/authActions";
import type { AuthActionState } from "@/types/auth";
import ResendVerification from "./ResendVerification";

const initialState: AuthActionState = { status: "idle" };

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  // After registration: show "check your email" screen inside the modal
  if (state.status === "verify_email" && state.email) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
          <Mail size={28} className="text-primary-600" />
        </div>
        <div>
          <h3 className="mb-1 text-base font-semibold text-text-primary">Check your inbox!</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-medium text-text-primary">{state.email}</span>.
            <br />Click it to activate your account.
          </p>
        </div>
        <p className="text-xs text-text-muted">Didn&apos;t receive it?</p>
        <ResendVerification email={state.email} />
      </div>
    );
  }

  const fieldError = (field: string) => state.fieldErrors?.[field]?.[0];

  const inputClass = (field: string) =>
    `glass-input px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:glass-input-focus outline-none w-full ${
      fieldError(field) ? "border-red-400" : ""
    }`;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" && state.error && !state.fieldErrors && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-firstName" className="text-sm font-medium text-text-primary">
            First name
          </label>
          <input
            id="reg-firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            placeholder="John"
            className={inputClass("firstName")}
          />
          {fieldError("firstName") && (
            <span className="text-xs text-red-600">{fieldError("firstName")}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-lastName" className="text-sm font-medium text-text-primary">
            Last name
          </label>
          <input
            id="reg-lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            placeholder="Doe"
            className={inputClass("lastName")}
          />
          {fieldError("lastName") && (
            <span className="text-xs text-red-600">{fieldError("lastName")}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-sm font-medium text-text-primary">
          Email address
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass("email")}
        />
        {fieldError("email") && (
          <span className="text-xs text-red-600">{fieldError("email")}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-phone" className="text-sm font-medium text-text-primary">
          Phone number
        </label>
        <input
          id="reg-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="+91 98765 43210"
          className={inputClass("phone")}
        />
        {fieldError("phone") && (
          <span className="text-xs text-red-600">{fieldError("phone")}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-sm font-medium text-text-primary">
          Password
          <span className="ml-1 text-xs font-normal text-text-muted">(min. 8 characters)</span>
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          className={inputClass("password")}
        />
        {fieldError("password") && (
          <span className="text-xs text-red-600">{fieldError("password")}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="gradient-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <UserPlus size={16} />
        {isPending ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
