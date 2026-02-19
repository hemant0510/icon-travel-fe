import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HotelFilters } from "@/types/hotel";

export const defaultHotelFilters: HotelFilters = {
  priceRange: [0, 100000],
  stars: [3, 4, 5],
  amenities: [],
};

type HotelStoreState = {
  filters: HotelFilters;
  destination: string;
  setFilters: (filters: HotelFilters) => void;
  setDestination: (destination: string) => void;
};

export const useHotelStore = create<HotelStoreState>()(
  persist(
    (set) => ({
      filters: defaultHotelFilters,
      destination: "",
      setFilters: (filters) => set({ filters }),
      setDestination: (destination) => set({ destination }),
    }),
    { name: "hotel-store" }
  )
);
