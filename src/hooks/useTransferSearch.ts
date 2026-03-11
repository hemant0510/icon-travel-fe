"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useCabStore } from "@/store/useCabStore";
import type { Vehicle } from "@/types/cab";

type UseTransferSearchReturn = {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (params: {
    startLocationCode: string;
    endAddressLine: string;
    endCityName: string;
    endZipCode: string;
    endCountryCode: string;
    endName: string;
    endGeoCode: string;
    transferType: string;
    startDateTime: string;
    passengers: number;
  }) => Promise<void>;
};

/**
 * Transfer search hook with persistent results.
 * 
 * FIXED: Results now persist in Zustand store, so navigating back from
 * detail page shows cached results instead of triggering a page refresh.
 */
export function useTransferSearch(): UseTransferSearchReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  
  // Get persistent state from Zustand store
  const { 
    searchResults, 
    hasSearched, 
    setSearchResults, 
    setHasSearched, 
    setLastSearchParams 
  } = useCabStore();
  
  // Hydrate store on mount (needed because of skipHydration)
  useEffect(() => {
    useCabStore.persist.rehydrate();
  }, []);

  const search = useCallback(async (params: {
    startLocationCode: string;
    endAddressLine: string;
    endCityName: string;
    endZipCode: string;
    endCountryCode: string;
    endName: string;
    endGeoCode: string;
    transferType: string;
    startDateTime: string;
    passengers: number;
  }) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);
    setSearchResults([]); // Clear previous results
    setHasSearched(true);
    setLastSearchParams(params);

    try {
      const res = await fetch("/api/transfers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(params),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data?.error?.message || data?.error || "Search failed";
        throw new Error(message);
      }

      setSearchResults(data.vehicles || []); // Store in Zustand
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch transfers. Please try again.");
    } finally {
      setLoading(false);
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }, [setSearchResults, setHasSearched, setLastSearchParams]);

  return { vehicles: searchResults, loading, error, hasSearched, search };
}
