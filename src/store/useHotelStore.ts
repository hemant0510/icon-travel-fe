import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HotelFilters, SortOption } from "@/types/hotel";

export const defaultHotelFilters: HotelFilters = {
  priceRange: [0, 100000],
  stars: [3, 4, 5],
  amenities: [],
};

type HotelStoreState = {
  filters: HotelFilters;
  sortBy: SortOption;
  destination: string;

  setFilters: (filters: HotelFilters) => void;
  setSortBy: (sortBy: SortOption) => void;
  setDestination: (destination: string) => void;
};

export const useHotelStore = create<HotelStoreState>()(
  persist(
    (set) => ({
      filters: defaultHotelFilters,
      sortBy: "RECOMMENDED",
      destination: "",

      setFilters: (filters) => set({ filters }),
      setSortBy: (sortBy) => set({ sortBy }),
      setDestination: (destination) => set({ destination }),
    }),
    { name: "hotel-store" }
  )
);
