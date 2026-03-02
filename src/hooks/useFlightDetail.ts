"use client";

import { useState, useEffect, useRef } from "react";
import type { UnifiedFlight, PricedFlightOffer } from "@/types/flight";

export type UseFlightDetailReturn = {
  pricedOffer: PricedFlightOffer | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

/**
 * Fetches detailed pricing for a flight offer.
 * 
 * FIXED ISSUES:
 * - Added AbortController to cancel stale requests
 * - Fixed dependency array to use stable flight.id instead of flight object
 * - Added retry mechanism
 * - Proper error state management
 */
export function useFlightDetail(flight: UnifiedFlight | null): UseFlightDetailReturn {
  const [pricedOffer, setPricedOffer] = useState<PricedFlightOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const retry = () => setRetryTrigger((prev) => prev + 1);

  useEffect(() => {
    if (!flight?.rawOffer) {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();
    let isActive = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch("/api/flights/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawOffer: flight.rawOffer }),
          signal: abortController.signal,
        });

        if (!isActive) return; // Component unmounted

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error?.message || "Failed to fetch flight details");
        }
        
        setPricedOffer(data.pricedOffer ?? null);
      } catch (err) {
        if (!isActive) return; // Component unmounted
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request was cancelled, not an error
        }
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [flight?.id, flight?.rawOffer, retryTrigger]); // Stable dependencies

  return { pricedOffer, loading, error, retry };
}
