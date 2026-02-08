"use client";

import { useMemo } from "react";
import type { UnifiedFlight } from "@/types/flight";
import { useFlightStore } from "@/store/useFlightStore";
import FlightSkeleton from "./FlightSkeleton";
import FlightCard from "./FlightCard";
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
      <p className="text-sm text-text-muted">
        {filteredFlights.length} flight{filteredFlights.length !== 1 ? "s" : ""} found
      </p>
      {filteredFlights.map((flight, i) => (
        <FlightCard key={flight.id} flight={flight} index={i} />
      ))}
    </div>
  );
}
