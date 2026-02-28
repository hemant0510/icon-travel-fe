"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export function useHotelSearch(): UseHotelSearchReturn {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<UseHotelSearchReturn["lastSearchParams"]>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const cacheKeyRef = useRef("hotel-search-cache");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(cacheKeyRef.current);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        params?: UseHotelSearchReturn["lastSearchParams"];
        hotels?: Hotel[];
      };
      if (parsed?.params && Array.isArray(parsed?.hotels)) {
        setLastSearchParams(parsed.params);
        setHotels(parsed.hotels);
      }
    } catch {
      setLastSearchParams(null);
    }
  }, []);

  const writeCache = useCallback((params: UseHotelSearchReturn["lastSearchParams"], items: Hotel[]) => {
    try {
      sessionStorage.setItem(
        cacheKeyRef.current,
        JSON.stringify({ params, hotels: items })
      );
    } catch {
      return;
    }
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
    setHotels([]); // Clear previous results immediately
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
      setHotels(nextHotels);
      writeCache(params, nextHotels);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch hotels. Please try again.");
    } finally {
      // Only set loading false if this is still the active request
      if (controllerRef.current === controller) {
        setLoading(false);
        controllerRef.current = null;
      }
    }
  }, [writeCache]);

  return { 
    hotels, 
    loading, 
    error, 
    hasSearched: !!lastSearchParams, 
    lastSearchParams,
    search 
  };
}
