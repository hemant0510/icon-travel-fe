"use client";

import { useState } from "react";
import { MapPin, Calendar, Clock, Search } from "lucide-react";

const tripTypes = [
  { key: "one-way", label: "One Way" },
  { key: "round-trip", label: "Round Trip" },
  { key: "hourly", label: "Hourly Rental" },
] as const;

export default function CabSearchForm() {
  const [tripType, setTripType] = useState<string>("one-way");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex flex-col gap-4">
        {/* Trip type tabs */}
        <div className="flex gap-1 rounded-xl bg-surface-dim p-1">
          {tripTypes.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTripType(t.key)}
              className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                tripType === t.key
                  ? "gradient-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <MapPin size={13} className="mr-1 inline-block" />
              Pickup Location
            </label>
            <input
              type="text"
              placeholder="Enter pickup location"
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <MapPin size={13} className="mr-1 inline-block" />
              Drop-off Location
            </label>
            <input
              type="text"
              placeholder="Enter drop-off location"
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <Calendar size={13} className="mr-1 inline-block" />
              Date
            </label>
            <input
              type="date"
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <Clock size={13} className="mr-1 inline-block" />
              Time
            </label>
            <input
              type="time"
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          className="gradient-accent flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md shadow-accent-500/20 transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
        >
          <Search size={16} />
          Search Cabs
        </button>
      </div>
    </div>
  );
}
