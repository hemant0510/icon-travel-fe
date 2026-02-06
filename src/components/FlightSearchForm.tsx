"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import FlightResults from "./FlightResults";
import AirportInput from "./AirportInput";
import type { FlightSearchParams } from "@/types/flight";
import { searchFlightsAction, type FlightSearchState } from "@/app/actions/flightActions";
import { defaultFilters, useFlightStore } from "@/store/useFlightStore";
import { Search, Calendar, Users, ListOrdered } from "lucide-react";

type FlightSearchFormProps = {
  initialState: FlightSearchState;
  initialParams: FlightSearchParams;
};

export default function FlightSearchForm({ initialState, initialParams }: FlightSearchFormProps) {
  const [state, formAction, isPending] = useActionState(searchFlightsAction, initialState);
  const { addSearch, setFilters } = useFlightStore();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [origin, setOrigin] = useState(initialParams.origin);
  const [destination, setDestination] = useState(initialParams.destination);

  const canSubmit = useMemo(() => {
    return origin.trim().length === 3 && destination.trim().length === 3 && origin !== destination;
  }, [origin, destination]);

  useEffect(() => {
    if (state.status === "success") {
      const formData = formRef.current ? new FormData(formRef.current) : null;
      addSearch({
        origin: String(formData?.get("origin") ?? origin),
        destination: String(formData?.get("destination") ?? destination),
        departureDate: String(formData?.get("departureDate") ?? initialParams.departureDate),
        returnDate: String(formData?.get("returnDate") ?? initialParams.returnDate ?? "") || undefined,
      });
      setFilters(defaultFilters);
    }
  }, [state.status, addSearch, setFilters, initialParams, origin, destination]);

  return (
    <section className="flex flex-col gap-6">
      <form
        ref={formRef}
        action={formAction}
        className="glass-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AirportInput label="Origin" name="origin" value={origin} onChange={setOrigin} />
            <AirportInput
              label="Destination"
              name="destination"
              value={destination}
              onChange={setDestination}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor="departureDate">
                <Calendar size={13} className="mr-1 inline-block" />
                Departure Date
              </label>
              <input
                id="departureDate"
                name="departureDate"
                type="date"
                className="glass-input px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
                defaultValue={initialParams.departureDate}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor="returnDate">
                <Calendar size={13} className="mr-1 inline-block" />
                Return Date
              </label>
              <input
                id="returnDate"
                name="returnDate"
                type="date"
                className="glass-input px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
                defaultValue={initialParams.returnDate ?? ""}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor="adults">
                <Users size={13} className="mr-1 inline-block" />
                Travelers
              </label>
              <input
                id="adults"
                name="adults"
                type="number"
                min={1}
                max={9}
                className="glass-input px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
                defaultValue={initialParams.adults}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor="max">
                <ListOrdered size={13} className="mr-1 inline-block" />
                Max Results
              </label>
              <input
                id="max"
                name="max"
                type="number"
                min={1}
                max={250}
                className="glass-input px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
                defaultValue={initialParams.max ?? 25}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className="gradient-primary flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/20 transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search size={16} />
            {isPending ? "Searching..." : "Search Flights"}
          </button>
        </div>
      </form>

      <FlightResults
        status={state.status}
        flights={state.flights}
        isLoading={isPending}
        error={state.error}
      />
    </section>
  );
}
