"use client";

import { RotateCcw } from "lucide-react";
import { useCabStore, defaultCabFilters } from "@/store/useCabStore";
import type { VehicleCode, VehicleCategory } from "@/types/cab";

const vehicleCodeLabels: Record<VehicleCode, string> = {
  SDN: "Sedan",
  ELC: "Electric",
  CAR: "Car",
  SUV: "SUV",
  VAN: "Van",
  LMS: "Limousine",
  BUS: "Bus",
};

const categoryLabels: Record<VehicleCategory, string> = {
  ST: "Standard",
  BU: "Business",
  FC: "First Class",
};

const categoryColors: Record<VehicleCategory, string> = {
  ST: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BU: "bg-blue-50 text-blue-700 border-blue-200",
  FC: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function CabFilters() {
  const filters = useCabStore((s) => s.filters);
  const toggleVehicleCode = useCabStore((s) => s.toggleVehicleCode);
  const toggleCategory = useCabStore((s) => s.toggleCategory);
  const setPriceRange = useCabStore((s) => s.setPriceRange);
  const resetFilters = useCabStore((s) => s.resetFilters);

  const hasActiveFilters =
    filters.vehicleCodes.length > 0 ||
    filters.categories.length > 0 ||
    filters.priceRange[0] !== defaultCabFilters.priceRange[0] ||
    filters.priceRange[1] !== defaultCabFilters.priceRange[1];

  return (
    <div className="glass-card flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex cursor-pointer items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-text-secondary">Price Range (EUR)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            className="glass-input w-full px-3 py-1.5 text-xs text-text-primary focus:glass-input-focus"
            placeholder="Min"
            value={filters.priceRange[0] || ""}
            onChange={(e) =>
              setPriceRange([parseInt(e.target.value) || 0, filters.priceRange[1]])
            }
          />
          <span className="text-xs text-text-muted">-</span>
          <input
            type="number"
            min={0}
            className="glass-input w-full px-3 py-1.5 text-xs text-text-primary focus:glass-input-focus"
            placeholder="Max"
            value={filters.priceRange[1] || ""}
            onChange={(e) =>
              setPriceRange([filters.priceRange[0], parseInt(e.target.value) || 5000])
            }
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-text-secondary">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(categoryLabels) as VehicleCategory[]).map((cat) => {
            const active = filters.categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  active
                    ? categoryColors[cat]
                    : "border-border-light text-text-muted hover:border-border-default"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vehicle types */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-text-secondary">Vehicle Type</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(vehicleCodeLabels) as VehicleCode[]).map((code) => {
            const active = filters.vehicleCodes.includes(code);
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleVehicleCode(code)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  active
                    ? "border-primary-300 bg-primary-50 text-primary-700"
                    : "border-border-light text-text-muted hover:border-border-default"
                }`}
              >
                {vehicleCodeLabels[code]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
