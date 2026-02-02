"use client";

import { useFlightStore } from "@/store/useFlightStore";

export default function FlightFilters() {
  const { filters, preferences, setFilters, setPreferences } = useFlightStore();

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-zinc-700">Price Range</p>
          <div className="flex gap-3">
            <input
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              type="number"
              min={0}
              value={filters.priceRange[0]}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  priceRange: [Number(event.target.value), filters.priceRange[1]],
                })
              }
            />
            <input
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              type="number"
              min={0}
              value={filters.priceRange[1]}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  priceRange: [filters.priceRange[0], Number(event.target.value)],
                })
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-zinc-700">Stops</p>
          <div className="flex flex-wrap gap-3 text-sm text-zinc-600">
            {[0, 1, 2].map((stops) => (
              <label key={stops} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.stops.includes(stops)}
                  onChange={(event) => {
                    const nextStops = event.target.checked
                      ? Array.from(new Set([...filters.stops, stops]))
                      : filters.stops.filter((value) => value !== stops);
                    setFilters({ ...filters, stops: nextStops });
                  }}
                />
                <span>{stops === 0 ? "Non-stop" : `${stops} stop`}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-zinc-700">Cabin Class</p>
          <select
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={preferences.cabinClass}
            onChange={(event) =>
              setPreferences({
                ...preferences,
                cabinClass: event.target.value as typeof preferences.cabinClass,
              })
            }
          >
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-zinc-700">Currency</p>
          <input
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            value={preferences.currency}
            readOnly
          />
        </div>
      </div>
    </section>
  );
}
