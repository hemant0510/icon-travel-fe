"use client";

import type { Vehicle } from "@/types/cab";
import { Users, Briefcase, Car, Zap } from "lucide-react";
import { formatCurrency, convertCurrencyAmount, type CurrencyRates, DEFAULT_CURRENCY } from "@/lib/currency";
import { useCurrencyStore } from "@/store/useCurrencyStore";

const typeLabels: Record<Vehicle["type"], string> = {
  sedan: "Sedan",
  suv: "SUV",
  hatchback: "Hatchback",
  luxury: "Luxury",
  van: "Van",
  auto: "Auto",
};

const typeColors: Record<Vehicle["type"], string> = {
  sedan: "bg-primary-50 text-primary-600",
  suv: "bg-emerald-50 text-emerald-600",
  hatchback: "bg-violet-50 text-violet-600",
  luxury: "bg-amber-50 text-amber-700",
  van: "bg-cyan-50 text-cyan-600",
  auto: "bg-rose-50 text-rose-600",
};

type CabResultsProps = {
  vehicles: Vehicle[];
  initialCurrency?: string;
  rates?: CurrencyRates | null;
};

export default function CabResults({ vehicles, initialCurrency, rates }: CabResultsProps) {
  const { currency } = useCurrencyStore();
  const displayCurrency = currency || initialCurrency || DEFAULT_CURRENCY;

  if (vehicles.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 p-8 text-center">
        <Car size={28} className="text-text-muted" />
        <p className="text-sm text-text-secondary">No vehicles available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">
        {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} available
      </p>
      {vehicles.map((vehicle, i) => {
        const convertedPricePerKm = rates
          ? convertCurrencyAmount(vehicle.pricePerKm, vehicle.currency, displayCurrency, rates)
          : vehicle.pricePerKm;
        
        const convertedBasePrice = rates
          ? convertCurrencyAmount(vehicle.basePrice, vehicle.currency, displayCurrency, rates)
          : vehicle.basePrice;

        const finalCurrency = rates ? displayCurrency : vehicle.currency;

        return (
        <article
          key={vehicle.id}
          className="glass-card overflow-hidden transition-all duration-300 hover:glass-card-hover animate-fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Gradient image placeholder */}
            <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-primary-300 to-primary-500 sm:h-auto sm:w-44 sm:min-h-[160px]">
              <Car className="text-white/50" size={36} />
            </div>

            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {vehicle.name}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[vehicle.type]}`}
                  >
                    {typeLabels[vehicle.type]}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-3 text-sm text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {vehicle.capacity} seats
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} /> {vehicle.luggage} bags
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {vehicle.features.map((feature) => (
                    <span
                      key={feature}
                      className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600"
                    >
                      <Zap size={10} />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-border-light pt-3">
                <div className="text-xs text-text-muted">
                  {formatCurrency(convertedPricePerKm, finalCurrency)}{" "}
                  / km
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-700">
                    {formatCurrency(convertedBasePrice, finalCurrency)}
                  </p>
                  <p className="text-xs text-text-muted">base fare</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      )})}
    </div>
  );
}
