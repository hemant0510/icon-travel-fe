import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HotelFilters, Hotel } from "@/types/hotel";

export const defaultHotelFilters: HotelFilters = {
  priceRange: [0, 100000],
  stars: [3, 4, 5],
  amenities: [],
};

type HotelStoreState = {
  filters: HotelFilters;
  destination: string;
  hotels: Hotel[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  setFilters: (filters: HotelFilters) => void;
  setDestination: (destination: string) => void;
  setHotels: (hotels: Hotel[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHasSearched: (hasSearched: boolean) => void;
};

export const useHotelStore = create<HotelStoreState>()(
  persist(
    (set) => ({
      filters: defaultHotelFilters,
      destination: "",
      hotels: [],
      isLoading: false,
      error: null,
      hasSearched: false,
      setFilters: (filters) => set({ filters }),
      setDestination: (destination) => set({ destination }),
      setHotels: (hotels) => set({ hotels }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setHasSearched: (hasSearched) => set({ hasSearched }),
    }),
    { name: "hotel-store" }
  )
);
