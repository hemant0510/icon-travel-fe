"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import type { SessionUser } from "@/types/auth";

export function useSession() {
  const setUser   = useAuthStore((s) => s.setUser);
  const setLoaded = useAuthStore((s) => s.setLoaded);
  const user      = useAuthStore((s) => s.user);
  const isLoaded  = useAuthStore((s) => s.isLoaded);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user: SessionUser | null }) => {
        setUser(data.user);
        setLoaded(true);
      })
      .catch(() => {
        setUser(null);
        setLoaded(true);
      });
  }, [setUser, setLoaded]);

  return { user, isLoaded };
}
