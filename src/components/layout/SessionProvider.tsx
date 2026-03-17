"use client";

import { useSession } from "@/hooks/useSession";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  useSession();
  return <>{children}</>;
}
