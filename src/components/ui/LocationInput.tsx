"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import type { LocationData } from "@/models/responses/LocationSearchResponse";

type LocationInputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  subType?: "AIRPORT" | "CITY";
  placeholder?: string;
  allowFreeText?: boolean;
};

export default function LocationInput({ 
  label, 
  name, 
  value, 
  onChange, 
  subType = "AIRPORT",
  placeholder = "Search location...",
  allowFreeText = false
}: LocationInputProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<LocationData | null>(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (value && value !== query && value !== selected?.iataCode) {
        setQuery(value);
    }
  }, [value, query, selected]);

  const fetchLocations = useCallback(async (keyword: string) => {
    if (keyword.length < 3) {
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
  }, [subType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    onChange(allowFreeText ? val : "");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLocations(val);
    }, 300);
  };

  const handleSelect = (location: LocationData) => {
    setSelected(location);
    setQuery(location.iataCode);
    onChange(location.iataCode);
    setSuggestions([]);
    setIsFocused(false);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isOpen = isFocused && (suggestions.length > 0 || isLoading);
  const showEmpty =
    isFocused && query.length >= 3 && !isLoading && !fetchError && suggestions.length === 0 && !selected;

  return (
    <div
      ref={wrapperRef}
      className="relative flex flex-col gap-1.5"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!wrapperRef.current?.contains(nextTarget)) {
          setIsFocused(false);
        }
      }}
    >
      <label className="text-xs font-medium text-text-secondary" htmlFor={`${name}-display`}>
        <MapPin size={13} className="mr-1 inline-block" />
        {label}
      </label>

      <div className="relative">
        <input
          id={`${name}-display`}
          type="text"
          className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-text-muted" size={16} />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-surface-paper/95 p-1 shadow-lg backdrop-blur-md">
          {suggestions.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-primary-500/10"
              onClick={() => handleSelect(loc)}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-medium text-text-primary">
                  {loc.address.cityName}, {loc.address.countryCode}
                </span>
                <span className="font-mono text-xs text-text-muted">{loc.iataCode}</span>
              </div>
              <span className="text-xs text-text-secondary">{loc.name}</span>
            </button>
          ))}
        </div>
      )}

      {showEmpty && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-xl border border-white/10 bg-surface-paper/95 p-3 text-center text-sm text-text-muted shadow-lg backdrop-blur-md">
          No locations found
        </div>
      )}
    </div>
  );
}
