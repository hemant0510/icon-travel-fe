import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HotelFilters, SortOption, Hotel } from "@/types/hotel";

export const defaultHotelFilters: HotelFilters = {
  priceRange: [0, 100000],
  stars: [3, 4, 5],
  amenities: [],
};

type HotelStoreState = {
  filters: HotelFilters;
  sortBy: SortOption;
  destination: string;
  searchResults: Hotel[];
  hasSearched: boolean;
  lastSearchParams: {
    cityCode: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    currency?: string;
  } | null;

  setFilters: (filters: HotelFilters) => void;
  setSortBy: (sortBy: SortOption) => void;
  setDestination: (destination: string) => void;
  
  // Search results management
  setSearchResults: (hotels: Hotel[]) => void;
  setHasSearched: (searched: boolean) => void;
  setLastSearchParams: (params: HotelStoreState["lastSearchParams"]) => void;
  clearSearchResults: () => void;
};

export const useHotelStore = create<HotelStoreState>()(
  persist(
    (set) => ({
      filters: defaultHotelFilters,
      sortBy: "RECOMMENDED",
      destination: "",
      searchResults: [],
      hasSearched: false,
      lastSearchParams: null,

      setFilters: (filters) => set({ filters }),
      setSortBy: (sortBy) => set({ sortBy }),
      setDestination: (destination) => set({ destination }),
      
      // Search results management
      setSearchResults: (hotels) => set({ searchResults: hotels }),
      setHasSearched: (searched) => set({ hasSearched: searched }),
      setLastSearchParams: (params) => set({ lastSearchParams: params }),
      clearSearchResults: () => set({ 
        searchResults: [], 
        hasSearched: false, 
        lastSearchParams: null 
      }),
    }),
    {
      name: "hotel-store",
      skipHydration: true,
    }
  )
);
