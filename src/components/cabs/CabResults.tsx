"use client";

import { useState, useCallback } from "react";
import type { Vehicle, VehicleCode } from "@/types/cab";
import { Users, Briefcase, Car, Clock, MapPin, Shield, Building2, Truck, Zap, Crown } from "lucide-react";
import { useCabStore, defaultCabFilters } from "@/store/useCabStore";

const categoryStyles: Record<string, { bg: string; text: string; dot: string }> = {
  ST: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  BU: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  FC: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

const vehicleCodeLabels: Record<string, string> = {
  SDN: "Sedan",
  ELC: "Electric",
  CAR: "Car",
  SUV: "SUV",
  VAN: "Van",
  LMS: "Limousine",
  BUS: "Bus",
};

// Themed gradient fallbacks per vehicle type — matches website design system
const vehicleFallbacks: Record<VehicleCode, { gradient: string; icon: typeof Car }> = {
  SDN: { gradient: "from-blue-500/80 to-blue-700/90", icon: Car },
  ELC: { gradient: "from-emerald-500/80 to-teal-700/90", icon: Zap },
  CAR: { gradient: "from-primary-400/80 to-primary-600/90", icon: Car },
  SUV: { gradient: "from-slate-500/80 to-slate-700/90", icon: Truck },
  VAN: { gradient: "from-indigo-500/80 to-indigo-700/90", icon: Truck },
  LMS: { gradient: "from-amber-500/80 to-amber-700/90", icon: Crown },
  BUS: { gradient: "from-violet-500/80 to-violet-700/90", icon: Truck },
};

function formatDuration(iso?: string, minutes?: number): string | null {
  if (minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }
  if (iso) return iso.replace("PT", "").replace("H", "h ").replace("M", "m").trim();
  return null;
}

// Separate component to handle per-card image error state
function VehicleImage({ vehicle }: { vehicle: Vehicle }) {
  const [imgError, setImgError] = useState(false);
  const handleError = useCallback(() => setImgError(true), []);

  const fallback = vehicleFallbacks[vehicle.vehicleCode] || vehicleFallbacks.CAR;
  const FallbackIcon = fallback.icon;

  if (vehicle.imageUrl && !imgError) {
    return (
      <img
        src={vehicle.imageUrl}
        alt={vehicle.name}
        className="absolute inset-0 h-full w-full object-contain p-2"
        loading="lazy"
        onError={handleError}
      />
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${fallback.gradient}`}>
      <FallbackIcon className="text-white/40" size={36} />
    </div>
  );
}

type CabResultsProps = {
  vehicles: Vehicle[];
  loading?: boolean;
  hasSearched?: boolean;
};

export default function CabResults({ vehicles, loading, hasSearched }: CabResultsProps) {
  const filters = useCabStore((s) => s.filters);

  const filtered = vehicles.filter((v) => {
    if (filters.priceRange[0] !== defaultCabFilters.priceRange[0] || filters.priceRange[1] !== defaultCabFilters.priceRange[1]) {
      if (v.price < filters.priceRange[0] || v.price > filters.priceRange[1]) return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(v.category)) return false;
    if (filters.vehicleCodes.length > 0 && !filters.vehicleCodes.includes(v.vehicleCode)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-card animate-shimmer p-4">
            <div className="flex items-center gap-4">
              <div className="h-[72px] w-[100px] shrink-0 rounded-lg bg-surface-dim" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-36 rounded bg-surface-dim" />
                <div className="h-3 w-48 rounded bg-surface-dim" />
                <div className="h-3 w-24 rounded bg-surface-dim" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="h-5 w-14 rounded bg-surface-dim" />
                <div className="h-3 w-8 rounded bg-surface-dim" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
          <Car size={24} className="text-primary-400" />
        </div>
        <p className="text-sm text-text-secondary">
          Search for transfers to see available vehicles
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
          <Car size={24} className="text-primary-400" />
        </div>
        <p className="text-sm text-text-secondary">
          {vehicles.length > 0
            ? "No vehicles match your filters. Try adjusting the filters."
            : "No vehicles available for this route."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        {filtered.length !== vehicles.length && ` of ${vehicles.length}`}
      </p>

      {filtered.map((vehicle, i) => {
        const duration = formatDuration(vehicle.duration, vehicle.durationMinutes);
        const catStyle = categoryStyles[vehicle.category] || { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };

        return (
          <article
            key={vehicle.id}
            className="glass-card group overflow-hidden transition-all duration-200 hover:glass-card-hover animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-stretch">
              {/* Vehicle thumbnail */}
              <div className="relative w-[120px] shrink-0 overflow-hidden">
                <VehicleImage vehicle={vehicle} />
                <div className={`absolute left-2 top-2 h-2 w-2 rounded-full ring-1 ring-white/50 ${catStyle.dot}`} />
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3">
                {/* Left: vehicle details */}
                <div className="flex min-w-0 flex-col gap-1">
                  {/* Name + category */}
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-text-primary">
                      {vehicle.name}
                    </h3>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${catStyle.bg} ${catStyle.text}`}>
                      {vehicle.categoryLabel}
                    </span>
                  </div>

                  {/* Specs row */}
                  <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-0.5">
                      <Users size={11} className="text-text-muted" />
                      {vehicle.seats}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Briefcase size={11} className="text-text-muted" />
                      {vehicle.bags}
                    </span>
                    {duration && (
                      <span className="inline-flex items-center gap-0.5">
                        <Clock size={11} className="text-text-muted" />
                        {duration}
                      </span>
                    )}
                    {vehicle.distance && (
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin size={11} className="text-text-muted" />
                        {vehicle.distance.value} {vehicle.distance.unit}
                      </span>
                    )}
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                      {vehicleCodeLabels[vehicle.vehicleCode] || vehicle.vehicleCode}
                    </span>
                  </div>

                  {/* Provider row */}
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <Building2 size={10} />
                    <span>{vehicle.provider?.name}</span>
                    <span className="mx-0.5 text-border-default">·</span>
                    <Shield size={10} />
                    <span>{vehicle.transferType === "SHARED" ? "Shared" : "Private"}</span>
                  </div>
                </div>

                {/* Right: price */}
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold text-primary-700">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: vehicle.currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: vehicle.price < 100 ? 2 : 0,
                    }).format(vehicle.price)}
                  </p>
                  <p className="text-[10px] text-text-muted">total</p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
