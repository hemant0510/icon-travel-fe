"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Hotel, Car, Menu, X, LogIn } from "lucide-react";
import AuthButton from "@/components/auth/AuthButton";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/store/useAuthStore";

const navLinks = [
  { href: "/flights", label: "Flights", icon: Plane },
  { href: "/hotels", label: "Hotels", icon: Hotel },
  { href: "/cabs", label: "Cabs", icon: Car },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const user          = useAuthStore((s) => s.user);

  return (
    <>
      <nav className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-white">IF</span>
            </div>
            <span className="text-lg font-bold text-primary-800">
              Icon <span className="text-accent-500">Fly</span>
            </span>
          </Link>

          {/* Desktop links + Auth */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-100 text-primary-700"
                      : "text-text-secondary hover:bg-primary-50 hover:text-primary-600"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
            <div className="ml-2">
              <AuthButton />
            </div>
          </div>

          {/* Mobile: auth icon + toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {!user && (
              <button
                onClick={() => openAuthModal("login")}
                className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
                aria-label="Sign in"
              >
                <LogIn size={20} />
              </button>
            )}
            {user && <AuthButton />}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-lg p-2 text-text-secondary hover:bg-primary-50"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/20 px-4 pb-4 pt-2 md:hidden">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-100 text-primary-700"
                      : "text-text-secondary hover:bg-primary-50"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <AuthModal />
    </>
  );
}
