"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plane, Hotel, Car, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import userAuthService from "@/services/userAuthService";
import AuthModal from "@/components/auth/AuthModal";

const navLinks = [
  { href: "/flights", label: "Flights", icon: Plane },
  { href: "/hotels", label: "Hotels", icon: Hotel },
  { href: "/cabs", label: "Cabs", icon: Car },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auth state
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for auth state
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await userAuthService.logout();
      logout(); // clear zustand
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
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

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${active
                  ? "bg-primary-100 text-primary-700"
                  : "text-text-secondary hover:bg-primary-50 hover:text-primary-600"
                  }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Auth Buttons Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          {mounted && isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                  <User size={16} />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : mounted ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow hover:-translate-y-0.5"
            >
              Login or Create Account
              <ChevronDown size={18} className="ml-0.5 opacity-90 stroke-[2.5]" />
            </button>
          ) : null}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-text-secondary hover:bg-primary-50 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
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
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${active
                  ? "bg-primary-100 text-primary-700"
                  : "text-text-secondary hover:bg-primary-50"
                  }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}

          {/* Auth Buttons Mobile */}
          <div className="mt-4 border-t border-gray-100 pt-4 pb-2">
            {mounted && isAuthenticated ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                    <User size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : mounted ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setMobileOpen(false); setIsAuthModalOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl transition-all shadow-sm hover:shadow font-medium"
                >
                  Login or Create Account
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}
