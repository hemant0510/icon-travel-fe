"use client";

import { useRef, useEffect, useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { logoutAction } from "@/app/actions/authActions";
import { useAuthStore } from "@/store/useAuthStore";

export default function UserMenu() {
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  async function handleLogout() {
    setOpen(false);
    setUser(null);
    await logoutAction();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:bg-primary-50 hover:text-primary-600 transition-colors"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white">
          {initials}
        </span>
        <span className="hidden sm:block">{user.firstName}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 glass-card py-2 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-white/30">
            <p className="text-sm font-semibold text-text-primary">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
