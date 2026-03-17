"use client";

import { useActionState } from "react";
import { Mail, RefreshCw } from "lucide-react";
import { resendVerificationEmailAction } from "@/app/actions/authActions";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = { status: "idle" };

interface ResendVerificationProps {
  email: string;
}

export default function ResendVerification({ email }: ResendVerificationProps) {
  const [state, formAction, isPending] = useActionState(
    resendVerificationEmailAction,
    initialState
  );

  const sent = state.status === "verify_email";

  return (
    <form action={formAction}>
      <input type="hidden" name="email" value={email} />
      {sent ? (
        <p className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <Mail size={15} />
          Email resent! Check your inbox.
        </p>
      ) : (
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline disabled:opacity-50"
        >
          <RefreshCw size={13} className={isPending ? "animate-spin" : ""} />
          {isPending ? "Sending…" : "Resend verification email"}
        </button>
      )}
      {state.status === "error" && (
        <p className="mt-1 text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
