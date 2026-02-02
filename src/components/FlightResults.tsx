"use client";

import { useMemo } from "react";
import type { UnifiedFlight } from "@/types/flight";
import { useFlightStore } from "@/store/useFlightStore";
import FlightSkeleton from "./FlightSkeleton";

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
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        Submit a search to see live flight offers.
      </div>
    );
  }

  if (filteredFlights.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        No flights match the current search and filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredFlights.map((flight) => (
        <article
          key={flight.id}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {flight.carrierName ?? flight.carrierCode ?? "Carrier"}
              </p>
              <p className="text-lg font-semibold text-zinc-900">
                {flight.origin.iataCode} → {flight.destination.iataCode}
              </p>
              <p className="text-sm text-zinc-500">
                {flight.origin.city ?? "Origin"} • {flight.destination.city ?? "Destination"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-zinc-900">
                {Number.isNaN(Number(flight.priceTotal))
                  ? `${flight.currency ?? "INR"} ${flight.priceTotal}`
                  : new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: flight.currency ?? "INR",
                    }).format(Number(flight.priceTotal))}
              </p>
              <p className="text-xs text-zinc-500">{flight.duration ?? "Duration varies"}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
            <span className="rounded-full bg-zinc-100 px-3 py-1">
              {Math.max(0, flight.segments.length - 1)} stops
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1">
              {flight.segments.length} segments
            </span>
            {flight.segments[0]?.departure.at && (
              <span className="rounded-full bg-zinc-100 px-3 py-1">
                Departs {new Date(flight.segments[0].departure.at).toLocaleTimeString()}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
