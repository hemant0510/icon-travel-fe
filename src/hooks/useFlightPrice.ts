"use client";

import { useCallback, useRef, useState } from "react";

export type UseFlightPriceReturn = {
  priceDetail: Record<string, unknown> | null;
  isLoading: boolean;
  fetchPrice: (flightOffer: Record<string, unknown>) => Promise<void>;
};

export function useFlightPrice(): UseFlightPriceReturn {
  const [priceDetail, setPriceDetail] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchPrice = useCallback(async (flightOffer: Record<string, unknown>) => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    setIsLoading(true);
    try {
      const res = await fetch("/api/flights/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightOffer }),
      });
      if (res.ok) {
        const json = await res.json();
        setPriceDetail(json.data ?? null);
      }
    } catch {
      // silently fail — segment info still visible
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { priceDetail, isLoading, fetchPrice };
}
