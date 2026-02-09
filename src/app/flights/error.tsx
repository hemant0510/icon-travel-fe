"use client";

import { AlertCircle, RefreshCw, Search } from "lucide-react";
import Link from "next/link";

export default function FlightsError({
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
          Flight search failed
        </h2>
        <p className="mb-6 text-sm text-text-secondary">
          {error.message ||
            "Could not load flights. Please check your connection and try again."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="gradient-primary inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link
            href="/flights"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary-300 bg-white/60 px-6 py-3 text-sm font-semibold text-primary-700 transition-all hover:bg-primary-50"
          >
            <Search size={16} />
            New Search
          </Link>
        </div>
      </div>
    </div>
  );
}
