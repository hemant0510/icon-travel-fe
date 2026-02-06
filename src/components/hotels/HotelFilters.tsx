"use client";

import { useState } from "react";
import { useHotelStore, defaultHotelFilters } from "@/store/useHotelStore";
import { SlidersHorizontal, Star, ChevronDown, ChevronUp } from "lucide-react";

const allAmenities = ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking", "Beach Access"];

export default function HotelFilters() {
  const { filters, setFilters } = useHotelStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filterContent = (
    <div className="flex flex-col gap-5">
      {/* Price Range */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Price per night (INR)
        </p>
        <div className="flex gap-3">
          <input
            className="glass-input w-full px-3 py-2 text-sm text-text-primary focus:glass-input-focus"
            type="number"
            min={0}
            value={filters.priceRange[0]}
            onChange={(e) =>
              setFilters({
                ...filters,
                priceRange: [Number(e.target.value), filters.priceRange[1]],
              })
            }
          />
          <input
            className="glass-input w-full px-3 py-2 text-sm text-text-primary focus:glass-input-focus"
            type="number"
            min={0}
            value={filters.priceRange[1]}
            onChange={(e) =>
              setFilters({
                ...filters,
                priceRange: [filters.priceRange[0], Number(e.target.value)],
              })
            }
          />
        </div>
      </div>

      {/* Star Rating */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
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
                className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-primary-100 text-primary-700"
                    : "bg-surface-dim text-text-secondary hover:bg-primary-50"
                }`}
              >
                {star} <Star size={12} className={selected ? "fill-accent-400 text-accent-400" : ""} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Amenities
        </p>
        <div className="flex flex-wrap gap-2">
          {allAmenities.map((amenity) => {
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
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selected
                    ? "bg-primary-100 text-primary-700"
                    : "bg-surface-dim text-text-secondary hover:bg-primary-50"
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={() => setFilters(defaultHotelFilters)}
        className="cursor-pointer text-xs font-medium text-primary-600 hover:text-primary-700"
      >
        Reset all filters
      </button>
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
