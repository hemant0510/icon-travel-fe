import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CabFilters, VehicleCode, VehicleCategory, Vehicle } from "@/types/cab";

export const defaultCabFilters: CabFilters = {
  priceRange: [0, 5000],
  vehicleCodes: [],
  categories: [],
};

type CabStoreState = {
  filters: CabFilters;
  searchResults: Vehicle[];
  hasSearched: boolean;
  lastSearchParams: Record<string, unknown> | null;
  
  setFilters: (filters: CabFilters) => void;
  resetFilters: () => void;
  toggleVehicleCode: (code: VehicleCode) => void;
  toggleCategory: (cat: VehicleCategory) => void;
  setPriceRange: (range: [number, number]) => void;
  
  // Search results management
  setSearchResults: (vehicles: Vehicle[]) => void;
  setHasSearched: (searched: boolean) => void;
  setLastSearchParams: (params: Record<string, unknown> | null) => void;
  clearSearchResults: () => void;
};

export const useCabStore = create<CabStoreState>()(
  persist(
    (set, get) => ({
      filters: defaultCabFilters,
      searchResults: [],
      hasSearched: false,
      lastSearchParams: null,
      
      setFilters: (filters) => set({ filters }),
      resetFilters: () => set({ filters: defaultCabFilters }),
      toggleVehicleCode: (code) => {
        const current = get().filters.vehicleCodes;
        const next = current.includes(code)
          ? current.filter((c) => c !== code)
          : [...current, code];
        set({ filters: { ...get().filters, vehicleCodes: next } });
      },
      toggleCategory: (cat) => {
        const current = get().filters.categories;
        const next = current.includes(cat)
          ? current.filter((c) => c !== cat)
          : [...current, cat];
        set({ filters: { ...get().filters, categories: next } });
      },
      setPriceRange: (range) => {
        set({ filters: { ...get().filters, priceRange: range } });
      },
      
      // Search results management
      setSearchResults: (vehicles) => set({ searchResults: vehicles }),
      setHasSearched: (searched) => set({ hasSearched: searched }),
      setLastSearchParams: (params) => set({ lastSearchParams: params }),
      clearSearchResults: () => set({ 
        searchResults: [], 
        hasSearched: false, 
        lastSearchParams: null 
      }),
    }),
    {
      name: "cab-store",
      skipHydration: true,
    }
  )
);
