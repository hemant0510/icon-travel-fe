"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFlightStore } from "@/store/useFlightStore";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { getSupportedCurrencies, setClientCurrencyCookies } from "@/lib/currency";
import { useCurrencyStore } from "@/store/useCurrencyStore";

export default function FlightFilters() {
  const router = useRouter();
  const { filters, preferences, setFilters, setPreferences } = useFlightStore();
  const { currency, setManualCurrency, hydrateFromCookie } = useCurrencyStore();
  const [isCurrencyPending, startCurrencyTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currencyOptions = useMemo(() => getSupportedCurrencies(), []);

  useEffect(() => {
    hydrateFromCookie();
  }, [hydrateFromCookie]);

  useEffect(() => {
    if (preferences.currency !== currency) {
      setPreferences({ ...preferences, currency });
    }
  }, [currency, preferences, setPreferences]);

  const filterContent = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Price Range</p>
        <div className="flex gap-3">
          <input
            className="glass-input w-full px-3 py-2 text-sm text-text-primary focus:glass-input-focus"
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
            className="glass-input w-full px-3 py-2 text-sm text-text-primary focus:glass-input-focus"
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
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Stops</p>
        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
          {[0, 1, 2].map((stops) => (
            <label key={stops} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary-600 accent-primary-600"
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
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Cabin Class</p>
        <select
          className="glass-input px-3 py-2 text-sm text-text-primary focus:glass-input-focus"
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
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Currency</p>
        <select
          className="glass-input px-3 py-2 text-sm text-text-primary focus:glass-input-focus"
          value={currency}
          onChange={(event) =>
            (() => {
              const nextCurrency = event.target.value;
              setManualCurrency(nextCurrency);
              startCurrencyTransition(() => {
                setClientCurrencyCookies(nextCurrency);
                router.refresh();
              });
            })()
          }
          disabled={isCurrencyPending}
        >
        {currencyOptions.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <section className="glass-card hidden p-5 lg:block">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-text-primary">Filters</h2>
        </div>
        {filterContent}
      </section>

      {/* Mobile collapsible drawer */}
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
        {mobileOpen && <div className="mt-4 border-t border-border-light pt-4">{filterContent}</div>}
      </section>
    </>
  );
}
