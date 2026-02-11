"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plane, Hotel, Car, ArrowRight, Calendar, Users, Search } from "lucide-react";
import TabSwitcher from "@/components/ui/TabSwitcher";
import GradientButton from "@/components/ui/GradientButton";
import AirportInput from "@/components/AirportInput";
import type { TripType } from "@/types/flight";
import { getSupportedCurrencies, setClientCurrencyCookies } from "@/lib/currency";
import { useCurrencyStore } from "@/store/useCurrencyStore";

const tabs = [
  { key: "flights", label: "Flights", icon: <Plane size={16} /> },
  { key: "hotels", label: "Hotels", icon: <Hotel size={16} /> },
  { key: "cabs", label: "Cabs", icon: <Car size={16} /> },
];

type SearchTabsProps = {
  initialCurrency: string;
};

export default function SearchTabs({ initialCurrency }: SearchTabsProps) {
  const [activeTab, setActiveTab] = useState("flights");
  const router = useRouter();

  const handleSearch = () => {
    router.push(`/${activeTab}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Tabs */}
      <div className="mb-4 flex justify-center">
        <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Search card */}
      <div className="glass-card p-6 sm:p-8">
        {activeTab === "flights" && <FlightQuickSearch initialCurrency={initialCurrency} />}
        {activeTab === "hotels" && <HotelQuickSearch onSearch={handleSearch} />}
        {activeTab === "cabs" && <CabQuickSearch onSearch={handleSearch} />}
      </div>
    </div>
  );
}

function FlightQuickSearch({ initialCurrency }: { initialCurrency: string }) {
  const router = useRouter();
  const { currency, setManualCurrency, applyAutoCurrency, hydrateFromCookie } = useCurrencyStore();
  const [isPending, startTransition] = useTransition();
  const currencyOptions = useMemo(() => getSupportedCurrencies(), []);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState<TripType>("one-way");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);

  useEffect(() => {
    hydrateFromCookie();
  }, [hydrateFromCookie]);

  useEffect(() => {
    applyAutoCurrency(initialCurrency);
  }, [initialCurrency, applyAutoCurrency]);

  const canSubmit = useMemo(() => {
    if (origin.length !== 3 || destination.length !== 3 || origin === destination) return false;
    if (!departureDate) return false;
    if (tripType === "round-trip" && !returnDate) return false;
    return true;
  }, [origin, destination, departureDate, returnDate, tripType]);

  const handleSearch = () => {
    if (!canSubmit) return;
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate,
      adults: String(adults),
      tripType,
      currencyCode: currency,
    });
    if (tripType === "round-trip" && returnDate) {
      params.set("returnDate", returnDate);
    }
    router.push(`/flights?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Trip Type Toggle */}
      <div className="flex items-center gap-1 rounded-xl bg-white/20 p-1">
        <button
          type="button"
          onClick={() => setTripType("one-way")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tripType === "one-way"
              ? "bg-white text-primary-700 shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          One Way
        </button>
        <button
          type="button"
          onClick={() => setTripType("round-trip")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tripType === "round-trip"
              ? "bg-white text-primary-700 shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Round Trip
        </button>
      </div>

      {/* Origin / Destination */}
      <div className="grid gap-4 sm:grid-cols-2">
        <AirportInput label="From" name="home-origin" value={origin} onChange={setOrigin} />
        <AirportInput label="To" name="home-destination" value={destination} onChange={setDestination} />
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary" htmlFor="home-departureDate">
            <Calendar size={13} className="mr-1 inline-block" />
            Departure <span className="text-red-500">*</span>
          </label>
          <input
            id="home-departureDate"
            type="date"
            className="glass-input px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary" htmlFor="home-returnDate">
            <Calendar size={13} className="mr-1 inline-block" />
            Return {tripType === "round-trip" && <span className="text-red-500">*</span>}
          </label>
          <input
            id="home-returnDate"
            type="date"
            className={`glass-input px-4 py-2.5 text-sm focus:glass-input-focus ${
              tripType === "one-way"
                ? "cursor-not-allowed bg-zinc-50 text-text-muted opacity-60"
                : "text-text-primary"
            }`}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            disabled={tripType === "one-way"}
            required={tripType === "round-trip"}
          />
        </div>
      </div>

      {/* Travelers + Currency */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary" htmlFor="home-adults">
            <Users size={13} className="mr-1 inline-block" />
            Travelers
          </label>
          <input
            id="home-adults"
            type="number"
            min={1}
            max={9}
            className="glass-input px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value) || 1)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary" htmlFor="home-currency">
            Currency
          </label>
          <select
            id="home-currency"
            className="glass-input px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
            value={currency}
            onChange={(e) => {
              const nextCurrency = e.target.value;
              setManualCurrency(nextCurrency);
              startTransition(() => {
                setClientCurrencyCookies(nextCurrency);
                router.refresh();
              });
            }}
            disabled={isPending}
          >
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSearch}
        className="gradient-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/20 transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Search size={16} />
        Search Flights
      </button>
    </div>
  );
}

function HotelQuickSearch({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Destination</label>
        <div className="glass-input px-4 py-3 text-sm text-text-secondary">
          Where are you going?
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Check-in</label>
          <div className="glass-input px-4 py-3 text-sm text-text-secondary">
            Pick a date
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Check-out</label>
          <div className="glass-input px-4 py-3 text-sm text-text-secondary">
            Pick a date
          </div>
        </div>
      </div>
      <GradientButton onClick={onSearch} fullWidth>
        Search Hotels <ArrowRight size={16} />
      </GradientButton>
    </div>
  );
}

function CabQuickSearch({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Pickup</label>
          <div className="glass-input px-4 py-3 text-sm text-text-secondary">
            Enter pickup location
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Drop-off</label>
          <div className="glass-input px-4 py-3 text-sm text-text-secondary">
            Enter drop-off location
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Date</label>
          <div className="glass-input px-4 py-3 text-sm text-text-secondary">
            Pick a date
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Time</label>
          <div className="glass-input px-4 py-3 text-sm text-text-secondary">
            Pick a time
          </div>
        </div>
      </div>
      <GradientButton onClick={onSearch} fullWidth variant="accent">
        Search Cabs <ArrowRight size={16} />
      </GradientButton>
    </div>
  );
}
