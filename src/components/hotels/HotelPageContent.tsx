"use client";

import { useHotelSearch } from "@/hooks/useHotelSearch";
import HotelSearchForm from "@/components/hotels/HotelSearchForm";
import HotelResults from "@/components/hotels/HotelResults";
import HotelFilters from "@/components/hotels/HotelFilters";
import type { Hotel } from "@/types/hotel";

export type HotelPageContentProps = {
  fallbackHotels: Hotel[];
  initialParams?: {
    cityCode: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
  };
  autoSearch?: boolean;
};

export default function HotelPageContent({ fallbackHotels, initialParams, autoSearch }: HotelPageContentProps) {
  const { hotels, loading, error, hasSearched, search, lastSearchParams } = useHotelSearch();

  const urlParamsValid = Boolean(
    initialParams?.cityCode &&
    initialParams.cityCode.length === 3 &&
    initialParams.checkIn &&
    initialParams.checkOut
  );

  const effectiveParams = urlParamsValid ? initialParams : lastSearchParams || initialParams;

  const displayHotels = hasSearched ? hotels : fallbackHotels;
  
  // Key should change only when parameters significantly change to trigger re-render of form if needed,
  // but we want to be careful not to reset form state unnecessarily.
  const searchKey = effectiveParams
    ? `${effectiveParams.cityCode}-${effectiveParams.checkIn}-${effectiveParams.checkOut}-${effectiveParams.guests}-${effectiveParams.rooms}`
    : "default";

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside>
        <div className="lg:sticky lg:top-20">
          <HotelFilters />
        </div>
      </aside>
      <div className="flex flex-col gap-6">
        <HotelSearchForm
          key={searchKey}
          onSearch={search}
          loading={loading}
          error={error}
          hotels={displayHotels}
          hasSearched={hasSearched}
          initialParams={effectiveParams}
          autoSearch={autoSearch && !hasSearched}
        />
        <HotelResults
          hotels={displayHotels}
          loading={loading}
          error={error}
          searchParams={effectiveParams}
        />
      </div>
    </div>
  );
}
