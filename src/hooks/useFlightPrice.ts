"use client";

import { useCallback, useState } from "react";

export type UseFlightPriceReturn = {
  priceDetail: Record<string, unknown> | null;
  isLoading: boolean;
  error: string | null;
  fetchPrice: (flightOffer: Record<string, unknown>) => Promise<void>;
  retry: () => void;
};

/**
 * Fetches flight pricing details.
 * 
 * FIXED ISSUES:
 * - Removed fetchedRef lock (allows retry)
 * - Added proper error state
 * - Added retry mechanism
 * - Proper error handling instead of silent failures
 */
export function useFlightPrice(): UseFlightPriceReturn {
  const [priceDetail, setPriceDetail] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOffer, setLastOffer] = useState<Record<string, unknown> | null>(null);

  const fetchPrice = useCallback(async (flightOffer: Record<string, unknown>) => {
    setLastOffer(flightOffer);
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/flights/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightOffer }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `Request failed with status ${res.status}`);
      }
      
      const json = await res.json();
      setPriceDetail(json.data ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch pricing details";
      setError(message);
      console.error('useFlightPrice:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (lastOffer) {
      fetchPrice(lastOffer);
    }
  }, [lastOffer, fetchPrice]);

  return { priceDetail, isLoading, error, fetchPrice, retry };
}
