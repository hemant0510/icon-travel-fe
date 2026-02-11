import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CURRENCY } from "@/lib/currency";

export type FlightFilters = {
  priceRange: [number, number];
  stops: number[];
};

export type FlightPreferences = {
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  currency: string;
};

export type SearchHistoryItem = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
};

type FlightStoreState = {
  searchHistory: SearchHistoryItem[];
  filters: FlightFilters;
  preferences: FlightPreferences;
  addSearch: (item: SearchHistoryItem) => void;
  setFilters: (filters: FlightFilters) => void;
  setPreferences: (preferences: FlightPreferences) => void;
  clearHistory: () => void;
};

export const defaultFilters: FlightFilters = {
  priceRange: [0, 100000],
  stops: [0, 1, 2],
};

export const defaultPreferences: FlightPreferences = {
  cabinClass: "economy",
  currency: DEFAULT_CURRENCY,
};

export const useFlightStore = create<FlightStoreState>()(
  persist(
    (set) => ({
      searchHistory: [],
      filters: defaultFilters,
      preferences: defaultPreferences,
      addSearch: (item) =>
        set((state) => ({
          searchHistory: [item, ...state.searchHistory].slice(0, 10),
        })),
      setFilters: (filters) => set({ filters }),
      setPreferences: (preferences) => set({ preferences }),
      clearHistory: () => set({ searchHistory: [] }),
    }),
    { name: "flight-store" }
  )
);
