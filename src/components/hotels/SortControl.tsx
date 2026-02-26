"use client";

import { useHotelStore } from "@/store/useHotelStore";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Star, ThumbsUp } from "lucide-react";
import type { SortOption } from "@/types/hotel";

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ReactNode }[] = [
  { 
    id: "RECOMMENDED", 
    label: "Recommended", 
    icon: <ThumbsUp size={14} /> 
  },
  { 
    id: "PRICE_LOW_HIGH", 
    label: "Price: Low to High", 
    icon: <ArrowUpNarrowWide size={14} /> 
  },
  { 
    id: "PRICE_HIGH_LOW", 
    label: "Price: High to Low", 
    icon: <ArrowDownWideNarrow size={14} /> 
  },
  { 
    id: "RATING_HIGH_LOW", 
    label: "Top Rated", 
    icon: <Star size={14} /> 
  },
];

export default function SortControl() {
  const sortBy = useHotelStore((s) => s.sortBy);
  const setSortBy = useHotelStore((s) => s.setSortBy);

  return (
    <div className="glass-card mb-6 flex w-full flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm font-medium text-text-secondary">Sort by:</div>
      
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => {
          const isSelected = sortBy === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-surface-dim text-text-secondary hover:bg-surface-highlight hover:text-text-primary"
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
