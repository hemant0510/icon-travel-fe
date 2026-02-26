"use client";

import { useState } from "react";
import { useHotelStore, defaultHotelFilters } from "@/store/useHotelStore";
import { HOTEL_AMENITIES } from "@/constants/hotel";
import DualRangeSlider from "@/components/ui/DualRangeSlider";
import { SlidersHorizontal, Star, ChevronDown, ChevronUp, Check } from "lucide-react";

export default function HotelFilters() {
  const filters = useHotelStore(s => s.filters);
  const setFilters = useHotelStore(s => s.setFilters);
  const [mobileOpen, setMobileOpen] = useState(false);
  const priceChanged =
    filters.priceRange[0] !== defaultHotelFilters.priceRange[0] ||
    filters.priceRange[1] !== defaultHotelFilters.priceRange[1];
  const starsChanged =
    filters.stars.length !== defaultHotelFilters.stars.length ||
    defaultHotelFilters.stars.some((s) => !filters.stars.includes(s));
  const amenitiesChanged = filters.amenities.length > 0;
  const activeCount = [priceChanged, starsChanged, amenitiesChanged].filter(Boolean).length;

  const filterContent = (
    <div className="flex flex-col gap-6">
      {/* Header - Only show if filters are applied */}
      {activeCount > 0 && (
        <div className="flex items-center justify-between border-b border-border-light pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              {activeCount} Active Filters
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilters(defaultHotelFilters)}
            className="text-xs font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Price Range */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Price Range
          </p>
          <span className="text-xs font-medium text-text-muted">INR</span>
        </div>
        
        <div className="px-1 py-2">
          <DualRangeSlider
            min={0}
            max={100000}
            step={1000}
            value={filters.priceRange}
            onChange={(val) => setFilters({ ...filters, priceRange: val })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">
              Min Price
            </label>
            <div className="group relative rounded-xl border border-border-light bg-surface transition-all focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
              <div className="flex items-center px-3 py-2">
                <span className="text-sm font-medium text-text-muted">₹</span>
                <input
                  type="number"
                  min={0}
                  max={filters.priceRange[1]}
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const nextMin = Math.min(Math.max(val, 0), filters.priceRange[1]);
                    setFilters({ ...filters, priceRange: [nextMin, filters.priceRange[1]] });
                  }}
                  className="w-full bg-transparent pl-1 text-sm font-semibold text-text-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">
              Max Price
            </label>
            <div className="group relative rounded-xl border border-border-light bg-surface transition-all focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
              <div className="flex items-center px-3 py-2">
                <span className="text-sm font-medium text-text-muted">₹</span>
                <input
                  type="number"
                  min={filters.priceRange[0]}
                  max={100000}
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const nextMax = Math.min(Math.max(val, filters.priceRange[0]), 100000);
                    setFilters({ ...filters, priceRange: [filters.priceRange[0], nextMax] });
                  }}
                  className="w-full bg-transparent pl-1 text-sm font-semibold text-text-primary outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Star Rating
        </p>
        <div className="flex flex-wrap gap-2">
          {[3, 4, 5].map((star) => {
            const selected = filters.stars.includes(star);
            return (
              <button
                key={star}
                type="button"
                onClick={() => {
                  const next = selected
                    ? filters.stars.filter((s) => s !== star)
                    : [...filters.stars, star];
                  setFilters({ ...filters, stars: next });
                }}
                className={`flex h-9 min-w-[3rem] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border text-sm font-semibold transition-all ${
                  selected
                    ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm"
                    : "border-border-light bg-surface text-text-secondary hover:border-primary-200 hover:bg-primary-50/50"
                }`}
              >
                {star} <Star size={14} className={selected ? "fill-primary-700" : "fill-transparent"} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Amenities
        </p>
        <div className="flex flex-wrap gap-2">
          {HOTEL_AMENITIES.map((amenity) => {
            const selected = filters.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => {
                  const next = selected
                    ? filters.amenities.filter((a) => a !== amenity)
                    : [...filters.amenities, amenity];
                  setFilters({ ...filters, amenities: next });
                }}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  selected
                    ? "border-primary-200 bg-primary-50 text-primary-700 shadow-sm"
                    : "border-transparent bg-surface-dim text-text-secondary hover:bg-surface-highlight"
                }`}
              >
                {selected && <Check size={12} strokeWidth={3} />}
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <section className="glass-card hidden p-5 lg:block">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-text-primary">Filters</h2>
        </div>
        {filterContent}
      </section>

      {/* Mobile */}
      <section className="glass-card mb-4 p-4 lg:hidden">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-primary-600" />
            <span className="text-sm font-semibold text-text-primary">Filters</span>
          </div>
          {mobileOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {mobileOpen && (
          <div className="mt-4 border-t border-border-light pt-4">{filterContent}</div>
        )}
      </section>
    </>
  );
}
