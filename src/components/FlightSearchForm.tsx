"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import FlightResults from "./FlightResults";
import AirportInput from "./AirportInput";
import type { FlightSearchParams } from "@/types/flight";
import { searchFlightsAction, type FlightSearchState } from "@/app/actions/flightActions";
import { defaultFilters, useFlightStore } from "@/store/useFlightStore";

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
        className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="departureDate">
              Departure Date
            </label>
            <input
              id="departureDate"
              name="departureDate"
              type="date"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              defaultValue={initialParams.departureDate}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="returnDate">
              Return Date
            </label>
            <input
              id="returnDate"
              name="returnDate"
              type="date"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              defaultValue={initialParams.returnDate ?? ""}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="adults">
              Travelers
            </label>
            <input
              id="adults"
              name="adults"
              type="number"
              min={1}
              max={9}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              defaultValue={initialParams.adults}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="max">
              Max Results
            </label>
            <input
              id="max"
              name="max"
              type="number"
              min={1}
              max={250}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              defaultValue={initialParams.max ?? 25}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!canSubmit || isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          Search Flights
        </button>
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
