"use client";

import { useAuthStore } from "@/store/useAuthStore";

interface BookingGateProps {
  children: React.ReactNode;
  onBook?: () => void;
  className?: string;
}

export default function BookingGate({ children, onBook, className }: BookingGateProps) {
  const user          = useAuthStore((s) => s.user);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  function handleClick() {
    if (user) {
      onBook?.();
    } else {
      openAuthModal("login");
    }
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
