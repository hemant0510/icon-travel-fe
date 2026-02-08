"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import type { LocationData } from "@/models/responses/LocationSearchResponse";

type AirportInputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
};

export default function AirportInput({ label, name, value, onChange }: AirportInputProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<LocationData | null>(null);

  const displayValue = selected ? selected.iataCode : query;

  const fetchLocations = useCallback(async (keyword: string) => {
    if (keyword.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/locations/search?keyword=${encodeURIComponent(keyword)}`
      );
      const json = await res.json();
      setSuggestions(json.data ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    onChange("");

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
    isFocused && query.length >= 3 && !isLoading && suggestions.length === 0 && !selected;

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

      {/* Hidden input carries the IATA code for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Visible input */}
      <input
        id={`${name}-display`}
        className="glass-input px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        autoComplete="off"
        placeholder="Type at least 3 letters..."
        required
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-white p-1 shadow-lg scrollbar-thin">
          {isLoading && (
            <div className="flex items-center justify-center py-3 text-xs text-text-muted">
              <Loader2 size={14} className="mr-2 animate-spin" />
              Searching airports...
            </div>
          )}
          {suggestions.map((location) => (
            <button
              key={location.id}
              type="button"
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary-50"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(location);
              }}
            >
              {/* Left: IATA Code Badge */}
              <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold tracking-widest text-white shadow-sm">
                {location.iataCode}
              </span>

              {/* Right: City + Country (bold) / Airport Name */}
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <span className="truncate font-bold text-text-primary">
                  {location.address.cityName}, {location.address.countryName}
                </span>
                <span className="truncate text-xs text-text-muted">
                  {location.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showEmpty && (
        <div className="absolute top-full z-20 mt-2 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-xs text-text-muted shadow-lg">
          No airports found.
        </div>
      )}
    </div>
  );
}
