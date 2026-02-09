"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="glass-card mx-auto max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="mb-2 text-lg font-bold text-text-primary">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-text-secondary">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="gradient-primary inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}
