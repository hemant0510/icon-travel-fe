"use client";

import { LogIn } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import UserMenu from "./UserMenu";

export default function AuthButton() {
  const user     = useAuthStore((s) => s.user);
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  if (!isLoaded) {
    return <div className="h-9 w-20 animate-pulse rounded-xl bg-primary-100" />;
  }

  if (user) {
    return <UserMenu />;
  }

  return (
    <button
      onClick={() => openAuthModal("login")}
      className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
    >
      <LogIn size={16} />
      Sign In
    </button>
  );
}
