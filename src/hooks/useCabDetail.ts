"use client";

import { useState, useEffect } from "react";
import type { Vehicle } from "@/types/cab";

export type UseCabDetailReturn = {
  vehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
};

/**
 * Retrieves cab/transfer details from sessionStorage.
 * 
 * FIXED ISSUES:
 * - Removed fetchedRef lock (allows re-fetching when transferId changes)
 * - Proper error handling
 * - Resets state when transferId changes
 */
export function useCabDetail(transferId: string): UseCabDetailReturn {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transferId) {
      setLoading(false);
      setError("No transfer ID provided");
      return;
    }

    // Reset state when transferId changes
    setLoading(true);
    setError(null);
    setVehicle(null);

    try {
      const raw = sessionStorage.getItem(`cab_detail_${transferId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Vehicle;
        setVehicle(parsed);
      } else {
        setError("Transfer details not found. Please go back and select a vehicle again.");
      }
    } catch (err) {
      console.error('useCabDetail: Failed to parse vehicle data', err);
      setError("Failed to load transfer details.");
    } finally {
      setLoading(false);
    }
  }, [transferId]); // Re-run when transferId changes

  return { vehicle, loading, error };
}
