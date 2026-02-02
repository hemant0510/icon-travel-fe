"use client";

import { useMemo, useRef, useState } from "react";
import type { Airport } from "@/types/flight";

const INDIAN_AIRPORTS: Airport[] = [
  { iataCode: "DEL", city: "New Delhi", name: "Indira Gandhi International", country: "IN" },
  { iataCode: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj", country: "IN" },
  { iataCode: "BLR", city: "Bengaluru", name: "Kempegowda International", country: "IN" },
  { iataCode: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International", country: "IN" },
  { iataCode: "MAA", city: "Chennai", name: "Chennai International", country: "IN" },
  { iataCode: "CCU", city: "Kolkata", name: "Netaji Subhash Chandra Bose", country: "IN" },
  { iataCode: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel", country: "IN" },
  { iataCode: "GOI", city: "Goa", name: "Dabolim", country: "IN" },
  { iataCode: "GOX", city: "Goa", name: "Manohar International", country: "IN" },
  { iataCode: "COK", city: "Kochi", name: "Cochin International", country: "IN" },
  { iataCode: "TRV", city: "Thiruvananthapuram", name: "Trivandrum International", country: "IN" },
  { iataCode: "PNQ", city: "Pune", name: "Pune", country: "IN" },
  { iataCode: "JAI", city: "Jaipur", name: "Jaipur International", country: "IN" },
  { iataCode: "IXC", city: "Chandigarh", name: "Chandigarh", country: "IN" },
  { iataCode: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh", country: "IN" },
  { iataCode: "PAT", city: "Patna", name: "Jay Prakash Narayan", country: "IN" },
  { iataCode: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi", country: "IN" },
  { iataCode: "DIB", city: "Dibrugarh", name: "Dibrugarh", country: "IN" },
  { iataCode: "IMF", city: "Imphal", name: "Imphal", country: "IN" },
  { iataCode: "AIZ", city: "Aizawl", name: "Lengpui", country: "IN" },
  { iataCode: "IXM", city: "Madurai", name: "Madurai", country: "IN" },
  { iataCode: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri", country: "IN" },
  { iataCode: "IXR", city: "Ranchi", name: "Birsa Munda", country: "IN" },
  { iataCode: "BBI", city: "Bhubaneswar", name: "Biju Patnaik", country: "IN" },
  { iataCode: "NAG", city: "Nagpur", name: "Dr. Babasaheb Ambedkar", country: "IN" },
  { iataCode: "IXB", city: "Bagdogra", name: "Bagdogra", country: "IN" },
  { iataCode: "RPR", city: "Raipur", name: "Swami Vivekananda", country: "IN" },
  { iataCode: "IDR", city: "Indore", name: "Devi Ahilya Bai Holkar", country: "IN" },
  { iataCode: "SXR", city: "Srinagar", name: "Srinagar", country: "IN" },
  { iataCode: "IXJ", city: "Jammu", name: "Jammu", country: "IN" },
  { iataCode: "ATQ", city: "Amritsar", name: "Sri Guru Ram Dass Jee", country: "IN" },
  { iataCode: "BHO", city: "Bhopal", name: "Raja Bhoj", country: "IN" },
  { iataCode: "GAY", city: "Gaya", name: "Gaya", country: "IN" },
  { iataCode: "IXU", city: "Aurangabad", name: "Aurangabad", country: "IN" },
  { iataCode: "PNY", city: "Puducherry", name: "Puducherry", country: "IN" },
  { iataCode: "IXZ", city: "Port Blair", name: "Veer Savarkar", country: "IN" },
  { iataCode: "VTZ", city: "Visakhapatnam", name: "Visakhapatnam", country: "IN" },
  { iataCode: "TIR", city: "Tirupati", name: "Tirupati", country: "IN" },
  { iataCode: "STV", city: "Surat", name: "Surat", country: "IN" },
  { iataCode: "BDQ", city: "Vadodara", name: "Vadodara", country: "IN" },
  { iataCode: "RJA", city: "Rajahmundry", name: "Rajahmundry", country: "IN" },
  { iataCode: "CJB", city: "Coimbatore", name: "Coimbatore", country: "IN" },
  { iataCode: "TRZ", city: "Tiruchirappalli", name: "Tiruchirappalli", country: "IN" },
  { iataCode: "IXE", city: "Mangaluru", name: "Mangaluru", country: "IN" },
  { iataCode: "IXD", city: "Prayagraj", name: "Prayagraj", country: "IN" },
  { iataCode: "IXL", city: "Leh", name: "Kushok Bakula Rimpochee", country: "IN" },
  { iataCode: "IXA", city: "Agartala", name: "Maharaja Bir Bikram", country: "IN" },
  { iataCode: "IXS", city: "Silchar", name: "Silchar", country: "IN" },
  { iataCode: "IXW", city: "Jamshedpur", name: "Sonari", country: "IN" },
  { iataCode: "KNU", city: "Kanpur", name: "Kanpur", country: "IN" },
  { iataCode: "UDR", city: "Udaipur", name: "Maharana Pratap", country: "IN" },
  { iataCode: "JDH", city: "Jodhpur", name: "Jodhpur", country: "IN" },
  { iataCode: "JLR", city: "Jabalpur", name: "Jabalpur", country: "IN" },
  { iataCode: "SAG", city: "Shirdi", name: "Shirdi", country: "IN" },
  { iataCode: "BHU", city: "Bhavnagar", name: "Bhavnagar", country: "IN" }
];

type AirportInputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
};

export default function AirportInput({ label, name, value, onChange }: AirportInputProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const displayValue = value.toUpperCase();
  const normalizedQuery = displayValue.trim();

  const suggestions = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return [];
    }
    const query = normalizedQuery.toUpperCase();
    return INDIAN_AIRPORTS
      .filter((airport) => {
        const haystack = `${airport.iataCode} ${airport.city ?? ""} ${airport.name ?? ""}`.toUpperCase();
        return haystack.includes(query);
      })
      .map((airport) => {
        const iata = airport.iataCode.toUpperCase();
        const city = (airport.city ?? "").toUpperCase();
        const name = (airport.name ?? "").toUpperCase();
        const score =
          iata.startsWith(query) ? 0 : city.startsWith(query) ? 1 : name.startsWith(query) ? 2 : 3;
        return { airport, score };
      })
      .sort((a, b) => {
        if (a.score !== b.score) {
          return a.score - b.score;
        }
        return a.airport.city?.localeCompare(b.airport.city ?? "") ?? 0;
      })
      .slice(0, 8)
      .map(({ airport }) => airport);
  }, [normalizedQuery]);

  const isOpen = isFocused && suggestions.length > 0;
  const showEmpty = isFocused && normalizedQuery.length > 0 && suggestions.length === 0;

  return (
    <div
      ref={wrapperRef}
      className="relative flex flex-col gap-2"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!wrapperRef.current?.contains(nextTarget)) {
          setIsFocused(false);
        }
      }}
    >
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        value={displayValue}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        onFocus={() => setIsFocused(true)}
        autoComplete="off"
        required
      />
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full z-10 mt-2 w-full rounded-xl border border-zinc-200 bg-white shadow-lg">
          {suggestions.map((airport) => (
            <button
              key={airport.iataCode}
              type="button"
              className="flex w-full flex-col gap-1 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
              onMouseDown={(event) => {
                event.preventDefault();
                onChange(airport.iataCode);
                setIsFocused(false);
              }}
            >
              <span className="font-semibold">
                {airport.city ?? airport.name ?? "Airport"} ({airport.iataCode})
              </span>
              <span className="text-xs text-zinc-500">
                {airport.name ?? "Airport"} • {airport.country ?? "Unknown"}
              </span>
            </button>
          ))}
        </div>
      )}
      {showEmpty && (
        <div className="absolute top-full z-10 mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-500 shadow-lg">
          No airports found.
        </div>
      )}
    </div>
  );
}
