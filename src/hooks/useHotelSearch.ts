"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useHotelStore } from "@/store/useHotelStore";
import type { Hotel } from "@/types/hotel";

type UseHotelSearchReturn = {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  lastSearchParams: {
    cityCode: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    currency?: string;
  } | null;
  search: (params: {
    cityCode: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    currency?: string;
  }) => Promise<void>;
};

/**
 * Hotel search hook with persistent results.
 * 
 * MIGRATED: From sessionStorage to Zustand persist for consistency with cabs.
 * Results now survive navigation back from detail pages.
 */
export function useHotelSearch(): UseHotelSearchReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Get persistent state from Zustand store
  const {
    searchResults,
    hasSearched,
    lastSearchParams,
    setSearchResults,
    setHasSearched,
    setLastSearchParams,
  } = useHotelStore();

  // Hydrate store on mount (needed because of skipHydration)
  useEffect(() => {
    useHotelStore.persist.rehydrate();
  }, []);

  const search = useCallback(async (params: {
    cityCode: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    currency?: string;
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
      const res = await fetch("/api/hotels/search", {
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

      const nextHotels = data.hotels || [];
      setSearchResults(nextHotels); // Store in Zustand
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch hotels. Please try again.");
    } finally {
      if (controllerRef.current === controller) {
        setLoading(false);
        controllerRef.current = null;
      }
    }
  }, [setSearchResults, setHasSearched, setLastSearchParams]);

  return { 
    hotels: searchResults, 
    loading, 
    error, 
    hasSearched, 
    lastSearchParams,
    search 
  };
}
