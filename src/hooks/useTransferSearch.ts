"use client";

import { useState, useCallback, useRef } from "react";
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

export function useTransferSearch(): UseTransferSearchReturn {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

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
    setVehicles([]);
    setHasSearched(true);

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

      setVehicles(data.vehicles || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch transfers. Please try again.");
    } finally {
      setLoading(false);
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }, []);

  return { vehicles, loading, error, hasSearched, search };
}
