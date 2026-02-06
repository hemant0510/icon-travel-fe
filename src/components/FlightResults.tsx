"use client";

import { useMemo } from "react";
import type { UnifiedFlight } from "@/types/flight";
import { useFlightStore } from "@/store/useFlightStore";
import FlightSkeleton from "./FlightSkeleton";
import { Plane, AlertCircle, Search } from "lucide-react";

type FlightResultsProps = {
  status: "idle" | "success" | "error";
  flights: UnifiedFlight[];
  isLoading: boolean;
  error?: string;
};

export default function FlightResults({ status, flights, isLoading, error }: FlightResultsProps) {
  const { filters } = useFlightStore();

  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      const total = Number(flight.priceTotal);
      const withinPrice =
        Number.isNaN(total) ||
        (total >= filters.priceRange[0] && total <= filters.priceRange[1]);
      const stops = Math.max(0, flight.segments.length - 1);
      const withinStops = filters.stops.includes(stops);
      return withinPrice && withinStops;
    });
  }, [flights, filters]);

  if (isLoading) {
    return <FlightSkeleton count={3} />;
  }

  if (error) {
    return (
      <div className="glass-card flex items-center gap-3 border-red-200 bg-red-50/80 p-4 text-sm text-red-600">
        <AlertCircle size={18} />
        {error}
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div className="glass-card flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
          <Search size={22} className="text-primary-400" />
        </div>
        <p className="text-sm text-text-secondary">
          Submit a search to see live flight offers.
        </p>
      </div>
    );
  }

  if (filteredFlights.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50">
          <Plane size={22} className="text-accent-400" />
        </div>
        <p className="text-sm text-text-secondary">
          No flights match the current search and filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredFlights.map((flight, i) => (
        <article
          key={flight.id}
          className="glass-card p-5 transition-all duration-300 hover:glass-card-hover animate-fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                {flight.carrierName ?? flight.carrierCode ?? "Carrier"}
              </p>
              <p className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                {flight.origin.iataCode}
                <span className="flex items-center gap-1 text-accent-500">
                  <span className="h-px w-6 bg-accent-300" />
                  <Plane size={14} />
                  <span className="h-px w-6 bg-accent-300" />
                </span>
                {flight.destination.iataCode}
              </p>
              <p className="text-sm text-text-secondary">
                {flight.origin.city ?? "Origin"} &bull; {flight.destination.city ?? "Destination"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary-700">
                {Number.isNaN(Number(flight.priceTotal))
                  ? `${flight.currency ?? "INR"} ${flight.priceTotal}`
                  : new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: flight.currency ?? "INR",
                    }).format(Number(flight.priceTotal))}
              </p>
              <p className="text-xs text-text-muted">{flight.duration ?? "Duration varies"}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-primary-50 px-3 py-1 font-medium text-primary-600">
              {Math.max(0, flight.segments.length - 1)} stops
            </span>
            <span className="rounded-full bg-accent-50 px-3 py-1 font-medium text-accent-600">
              {flight.segments.length} segments
            </span>
            {flight.segments[0]?.departure.at && (
              <span className="rounded-full bg-surface-dim px-3 py-1 text-text-secondary">
                Departs {new Date(flight.segments[0].departure.at).toLocaleTimeString()}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
