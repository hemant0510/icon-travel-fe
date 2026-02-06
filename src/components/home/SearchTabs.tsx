"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Hotel, Car, ArrowRight } from "lucide-react";
import TabSwitcher from "@/components/ui/TabSwitcher";
import GradientButton from "@/components/ui/GradientButton";

const tabs = [
  { key: "flights", label: "Flights", icon: <Plane size={16} /> },
  { key: "hotels", label: "Hotels", icon: <Hotel size={16} /> },
  { key: "cabs", label: "Cabs", icon: <Car size={16} /> },
];

export default function SearchTabs() {
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
        {activeTab === "flights" && <FlightQuickSearch onSearch={handleSearch} />}
        {activeTab === "hotels" && <HotelQuickSearch onSearch={handleSearch} />}
        {activeTab === "cabs" && <CabQuickSearch onSearch={handleSearch} />}
      </div>
    </div>
  );
}

function FlightQuickSearch({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">From</label>
          <div className="glass-input px-4 py-3 text-sm text-text-secondary">
            Select departure city
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">To</label>
          <div className="glass-input px-4 py-3 text-sm text-text-secondary">
            Select arrival city
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Departure</label>
          <div className="glass-input px-4 py-3 text-sm text-text-secondary">
            Pick a date
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Travellers</label>
          <div className="glass-input px-4 py-3 text-sm text-text-secondary">
            1 Adult
          </div>
        </div>
      </div>
      <GradientButton onClick={onSearch} fullWidth>
        Search Flights <ArrowRight size={16} />
      </GradientButton>
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
