"use client";

import { useHotelSearch } from "@/hooks/useHotelSearch";
import HotelSearchForm from "@/components/hotels/HotelSearchForm";
import HotelResults from "@/components/hotels/HotelResults";
import HotelFilters from "@/components/hotels/HotelFilters";
import type { Hotel } from "@/types/hotel";

export type HotelPageContentProps = {
  fallbackHotels: Hotel[];
};

export default function HotelPageContent({ fallbackHotels }: HotelPageContentProps) {
  const { hotels, loading, error, hasSearched, search } = useHotelSearch();

  const displayHotels = hasSearched ? hotels : fallbackHotels;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside>
        <div className="lg:sticky lg:top-20">
          <HotelFilters />
        </div>
      </aside>
      <div className="flex flex-col gap-6">
        <HotelSearchForm
          onSearch={search}
          loading={loading}
          error={error}
          hotels={displayHotels}
          hasSearched={hasSearched}
        />
        <HotelResults
          hotels={displayHotels}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
