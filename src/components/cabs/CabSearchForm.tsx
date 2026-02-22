"use client";

import { useState } from "react";
import { Calendar, Clock, Search, Users, Loader2 } from "lucide-react";
import LocationInput from "@/components/ui/LocationInput";
import type { LocationData } from "@/models/responses/LocationSearchResponse";
import type { TransferType } from "@/types/cab";

const tripTypes: { key: TransferType; label: string }[] = [
  { key: "PRIVATE", label: "One Way" },
  { key: "SHARED", label: "Shared" },
];

type CabSearchFormProps = {
  onSearch: (params: {
    startLocationCode: string;
    endAddressLine: string;
    endCityName: string;
    endZipCode: string;
    endCountryCode: string;
    endName: string;
    endGeoCode: string;
    transferType: string;
    startDateTime: string;
    passengers: number;
  }) => void;
  loading?: boolean;
  error?: string | null;
};

export default function CabSearchForm({ onSearch, loading, error }: CabSearchFormProps) {
  const [transferType, setTransferType] = useState<TransferType>("PRIVATE");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [passengers, setPassengers] = useState(1);

  const [dropoffLocation, setDropoffLocation] = useState<LocationData | null>(null);

  const handleDropoffLocationSelect = (location: LocationData) => {
    setDropoffLocation(location);
  };

  const handleSubmit = () => {
    if (!pickup || !dropoffLocation || !date || !time) return;

    const loc = dropoffLocation;
    const startDateTime = `${date}T${time}:00`;
    const endGeoCode = `${loc.geoCode.latitude},${loc.geoCode.longitude}`;

    onSearch({
      startLocationCode: pickup,
      endAddressLine: loc.address.cityName || loc.name || "",
      endCityName: loc.address.cityName || "",
      endZipCode: "",
      endCountryCode: loc.address.countryCode || "",
      endName: loc.name || loc.address.cityName || "",
      endGeoCode,
      transferType,
      startDateTime,
      passengers,
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex flex-col gap-4">
        {/* Trip type tabs */}
        <div className="flex gap-1 rounded-xl bg-surface-dim p-1">
          {tripTypes.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTransferType(t.key)}
              className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                transferType === t.key
                  ? "gradient-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Pickup & Dropoff */}
        <div className="grid gap-4 sm:grid-cols-2">
          <LocationInput
            label="From (Airport)"
            name="pickup"
            value={pickup}
            onChange={setPickup}
            subType="AIRPORT"
            placeholder="Search airport (e.g. CDG, JFK)"
          />
          <LocationInput
            label="To (City / Hotel)"
            name="dropoff"
            value={dropoff}
            onChange={setDropoff}
            onLocationSelect={handleDropoffLocationSelect}
            subType="CITY"
            placeholder="Search destination city"
          />
        </div>

        {/* Date, Time, Passengers */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary" htmlFor="cab-date">
              <Calendar size={13} className="mr-1 inline-block" />
              Date
            </label>
            <input
              id="cab-date"
              type="date"
              min={today}
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary" htmlFor="cab-time">
              <Clock size={13} className="mr-1 inline-block" />
              Time
            </label>
            <input
              id="cab-time"
              type="time"
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary" htmlFor="cab-passengers">
              <Users size={13} className="mr-1 inline-block" />
              Passengers
            </label>
            <input
              id="cab-passengers"
              type="number"
              min={1}
              max={10}
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={passengers}
              onChange={(e) => setPassengers(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !pickup || !dropoffLocation || !date}
          className="gradient-accent flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md shadow-accent-500/20 transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search size={16} />
              Search Transfers
            </>
          )}
        </button>
      </div>
    </div>
  );
}
