"use client";

import { useEffect, useState } from "react";
import { X, Plane } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import TabSwitcher from "@/components/ui/TabSwitcher";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import type { AuthMode } from "@/types/auth";

const TABS = [
  { key: "login",    label: "Sign In" },
  { key: "register", label: "Create Account" },
];

export default function AuthModal() {
  const showAuthModal  = useAuthStore((s) => s.showAuthModal);
  const authModalMode  = useAuthStore((s) => s.authModalMode);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);

  const [activeTab, setActiveTab] = useState<AuthMode>(authModalMode);

  useEffect(() => {
    setActiveTab(authModalMode);
  }, [authModalMode]);

  useEffect(() => {
    if (!showAuthModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAuthModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showAuthModal, closeAuthModal]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showAuthModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div className="relative glass-card w-full max-w-md p-6 animate-fade-in">
        {/* Close */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-text-muted hover:bg-primary-50 hover:text-primary-600 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Plane size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {activeTab === "login" ? "Welcome back" : "Join Icon Fly"}
            </h2>
            <p className="text-xs text-text-muted">
              {activeTab === "login"
                ? "Sign in to continue booking"
                : "Create your account to start booking"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex rounded-xl bg-primary-50 p-1">
          {TABS.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as AuthMode)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "gradient-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-primary-600"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}

        {/* Switch mode */}
        <p className="mt-4 text-center text-xs text-text-muted">
          {activeTab === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setActiveTab("register")}
                className="font-medium text-primary-600 hover:underline"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setActiveTab("login")}
                className="font-medium text-primary-600 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
