"use client";

import { useState, useCallback, useRef } from "react";
import type { Hotel } from "@/types/hotel";

type UseHotelSearchReturn = {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
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
  const [hasSearched, setHasSearched] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

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
    setHotels([]);
    setHasSearched(true);

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

      setHotels(data.hotels || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch hotels. Please try again.");
    } finally {
      setLoading(false);
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }, []);

  return { hotels, loading, error, hasSearched, search };
}
