"use client";

import { useState } from "react";
import { Calendar, Users, DoorOpen, Search, Loader2 } from "lucide-react";
import { defaultHotelFilters, useHotelStore } from "@/store/useHotelStore";
import LocationInput from "@/components/ui/LocationInput";
import type { Hotel } from "@/types/hotel";

export type HotelSearchFormProps = {
  onSearch: (params: {
    cityCode: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    currency?: string;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
  hotels: Hotel[];
  hasSearched: boolean;
};

export default function HotelSearchForm({ onSearch, loading, error, hotels, hasSearched }: HotelSearchFormProps) {
  const storeDestination = useHotelStore(s => s.destination);
  const filters = useHotelStore(s => s.filters);
  const setFilters = useHotelStore(s => s.setFilters);
  const setStoreDestination = useHotelStore(s => s.setDestination);

  const currency = "INR";

  const [destination, setDestination] = useState(storeDestination);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);

  const normalizedDestination = destination.trim().toUpperCase();
  const isDestinationValid = /^[A-Z]{3}$/.test(normalizedDestination);
  const hasDateError =
    Boolean(checkIn && checkOut) && new Date(checkOut) <= new Date(checkIn);
  const canSubmit =
    isDestinationValid && Boolean(checkIn) && Boolean(checkOut) && !hasDateError && !loading;
  const destinationError =
    destination.length > 0 && !isDestinationValid
      ? "Enter a valid 3-letter city code (e.g., DEL)."
      : "";
  const dateError = hasDateError ? "Check-out must be after check-in." : "";

  const clampNumber = (value: string, min: number, max: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return min;
    return Math.min(max, Math.max(min, parsed));
  };

  const handleSearch = async () => {
    if (!isDestinationValid || !checkIn || !checkOut || hasDateError) {
      const message = !destination
        ? "Destination is required."
        : !isDestinationValid
        ? "Enter a valid 3-letter city code (e.g., DEL)."
        : !checkIn || !checkOut
        ? "Select check-in and check-out dates."
        : "Check-out must be after check-in.";
      setLocalError(message);
      return;
    }

    setLocalError(null);

    if (!hasSearched) {
      setFilters(defaultHotelFilters);
    }

    setStoreDestination(normalizedDestination);

    await onSearch({
      cityCode: normalizedDestination,
      checkIn,
      checkOut,
      guests,
      rooms,
      currency,
    });

    // Auto-adjust price filter if results exceed current range
    if (hotels.length > 0) {
      const maxPrice = Math.max(...hotels.map((hotel) => hotel.pricePerNight));
      if (maxPrice > filters.priceRange[1]) {
        setFilters({ ...filters, priceRange: [filters.priceRange[0], Math.ceil(maxPrice)] });
      }
    }
  };

  const displayError = localError || error;

  return (
    <form
      className="glass-card p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        handleSearch();
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <LocationInput
            label="Destination"
            name="destination"
            value={destination}
            onChange={setDestination}
            subType="CITY"
            placeholder="Where are you going?"
            allowFreeText
          />
          {destinationError && (
            <p className="text-xs text-red-500">{destinationError}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <Calendar size={13} className="mr-1 inline-block" />
              Check-in
            </label>
            <input
              type="date"
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <Calendar size={13} className="mr-1 inline-block" />
              Check-out
            </label>
            <input
              type="date"
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>
        {dateError && <p className="text-xs text-red-500">{dateError}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <Users size={13} className="mr-1 inline-block" />
              Guests
            </label>
            <input
              type="number"
              min={1}
              max={10}
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={guests}
              onChange={(e) => setGuests(clampNumber(e.target.value, 1, 10))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <DoorOpen size={13} className="mr-1 inline-block" />
              Rooms
            </label>
            <input
              type="number"
              min={1}
              max={5}
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={rooms}
              onChange={(e) => setRooms(clampNumber(e.target.value, 1, 5))}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="gradient-primary flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/20 transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
          {loading ? "Searching..." : "Search Hotels"}
        </button>
        {displayError && <p className="text-xs text-red-500">{displayError}</p>}
      </div>
    </form>
  );
}
