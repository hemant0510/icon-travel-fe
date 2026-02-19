"use client";

import { useCallback, useRef, useState } from "react";
import type { LocationData } from "@/models/responses/LocationSearchResponse";

export type UseLocationSearchOptions = {
  subType?: "AIRPORT" | "CITY";
  minChars?: number;
  debounceMs?: number;
};

export type UseLocationSearchReturn = {
  suggestions: LocationData[];
  isLoading: boolean;
  fetchError: boolean;
  search: (keyword: string) => void;
  clear: () => void;
};

export function useLocationSearch(options: UseLocationSearchOptions = {}): UseLocationSearchReturn {
  const { subType = "AIRPORT", minChars = 3, debounceMs = 300 } = options;

  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLocations = useCallback(
    async (keyword: string) => {
      if (keyword.length < minChars) {
        setSuggestions([]);
        setFetchError(false);
        return;
      }

      setIsLoading(true);
      setFetchError(false);
      try {
        const res = await fetch(
          `/api/locations/search?keyword=${encodeURIComponent(keyword)}&subType=${subType}`
        );
        if (!res.ok) {
          setFetchError(true);
          setSuggestions([]);
          return;
        }
        const json = await res.json();
        setSuggestions(json.data ?? []);
      } catch {
        setFetchError(true);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [subType, minChars]
  );

  const search = useCallback(
    (keyword: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchLocations(keyword);
      }, debounceMs);
    },
    [fetchLocations, debounceMs]
  );

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSuggestions([]);
    setFetchError(false);
  }, []);

  return { suggestions, isLoading, fetchError, search, clear };
}
