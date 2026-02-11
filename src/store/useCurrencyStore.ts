import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CURRENCY, getCurrencyFromCookieString, normalizeCurrencyCode } from "@/lib/currency";

type CurrencySource = "auto" | "manual";

type CurrencyState = {
  currency: string;
  source: CurrencySource;
  setManualCurrency: (currency: string) => void;
  applyAutoCurrency: (currency: string) => void;
  hydrateFromCookie: () => void;
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: DEFAULT_CURRENCY,
      source: "auto",
      setManualCurrency: (currency) => {
        const normalized = normalizeCurrencyCode(currency);
        set({ currency: normalized, source: "manual" });
      },
      applyAutoCurrency: (currency) => {
        const normalized = normalizeCurrencyCode(currency);
        if (get().source === "manual") return;
        set({ currency: normalized, source: "auto" });
      },
      hydrateFromCookie: () => {
        if (typeof document === "undefined") return;
        const nextCurrency = getCurrencyFromCookieString(document.cookie);
        // Always prioritize the server-resolved cookie, as it includes geo-detection and manual overrides
        if (nextCurrency) {
          const current = get();
      
          if (current.currency !== nextCurrency) {
             set({ currency: nextCurrency, source: "auto" }); 
          }
        }
      },
    }),
    { name: "currency-store" }
  )
);
