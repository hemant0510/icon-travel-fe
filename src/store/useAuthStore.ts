import { create } from "zustand";
import type { SessionUser, AuthMode } from "@/types/auth";

interface AuthStore {
  user: SessionUser | null;
  isLoaded: boolean;
  showAuthModal: boolean;
  authModalMode: AuthMode;
  setUser: (user: SessionUser | null) => void;
  setLoaded: (loaded: boolean) => void;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user:          null,
  isLoaded:      false,
  showAuthModal: false,
  authModalMode: "login",

  setUser:    (user) => set({ user }),
  setLoaded:  (loaded) => set({ isLoaded: loaded }),
  openAuthModal:  (mode = "login") => set({ showAuthModal: true, authModalMode: mode }),
  closeAuthModal: () => set({ showAuthModal: false }),
}));
