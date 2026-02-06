"use client";

import { useState } from "react";
import { MapPin, Calendar, Users, DoorOpen, Search } from "lucide-react";
import { useHotelStore } from "@/store/useHotelStore";

export default function HotelSearchForm() {
  const { destination, setDestination } = useHotelStore();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            <MapPin size={13} className="mr-1 inline-block" />
            Destination
          </label>
          <input
            type="text"
            placeholder="Where are you going?"
            className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <Calendar size={13} className="mr-1 inline-block" />
              Check-in
            </label>
            <input
              type="date"
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <Calendar size={13} className="mr-1 inline-block" />
              Check-out
            </label>
            <input
              type="date"
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <Users size={13} className="mr-1 inline-block" />
              Guests
            </label>
            <input
              type="number"
              min={1}
              max={10}
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              <DoorOpen size={13} className="mr-1 inline-block" />
              Rooms
            </label>
            <input
              type="number"
              min={1}
              max={5}
              className="glass-input w-full px-4 py-2.5 text-sm text-text-primary focus:glass-input-focus"
              value={rooms}
              onChange={(e) => setRooms(Number(e.target.value))}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {}}
          className="gradient-primary flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/20 transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
        >
          <Search size={16} />
          Search Hotels
        </button>
      </div>
    </div>
  );
}
