"use client";

import { useMemo } from "react";
import type { Hotel } from "@/types/hotel";
import { useHotelStore } from "@/store/useHotelStore";
import { Star, MapPin, Wifi, Waves, Dumbbell, UtensilsCrossed } from "lucide-react";

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={12} />,
  Pool: <Waves size={12} />,
  Gym: <Dumbbell size={12} />,
  Restaurant: <UtensilsCrossed size={12} />,
};

export default function HotelResults({ hotels }: { hotels: Hotel[] }) {
  const { filters, destination } = useHotelStore();

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const withinPrice =
        hotel.pricePerNight >= filters.priceRange[0] &&
        hotel.pricePerNight <= filters.priceRange[1];
      const withinStars = filters.stars.includes(hotel.stars);
      const matchesDestination =
        !destination ||
        hotel.city.toLowerCase().includes(destination.toLowerCase()) ||
        hotel.name.toLowerCase().includes(destination.toLowerCase());
      const matchesAmenities =
        filters.amenities.length === 0 ||
        filters.amenities.every((a) => hotel.amenities.includes(a));
      return withinPrice && withinStars && matchesDestination && matchesAmenities;
    });
  }, [hotels, filters, destination]);

  if (filteredHotels.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 p-8 text-center">
        <MapPin size={28} className="text-text-muted" />
        <p className="text-sm text-text-secondary">
          No hotels match your search criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">
        {filteredHotels.length} hotel{filteredHotels.length !== 1 ? "s" : ""} found
      </p>
      {filteredHotels.map((hotel, i) => (
        <article
          key={hotel.id}
          className="glass-card overflow-hidden transition-all duration-300 hover:glass-card-hover animate-fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Gradient placeholder image */}
            <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-primary-400 to-accent-400 sm:h-auto sm:w-56 sm:min-h-[200px]">
              <MapPin className="text-white/50" size={40} />
            </div>

            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: hotel.stars }).map((_, j) => (
                      <Star
                        key={j}
                        size={12}
                        className="fill-accent-400 text-accent-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="mb-2 flex items-center gap-1 text-sm text-text-secondary">
                  <MapPin size={13} />
                  {hotel.city}, {hotel.country}
                </p>
                <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                  {hotel.description}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5">
                  {hotel.amenities.slice(0, 5).map((amenity) => (
                    <span
                      key={amenity}
                      className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600"
                    >
                      {amenityIcons[amenity]}
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-border-light pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-lg bg-primary-600 px-2 py-1 text-xs font-bold text-white">
                    {hotel.rating}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({hotel.reviewCount.toLocaleString()} reviews)
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-700">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: hotel.currency,
                    }).format(hotel.pricePerNight)}
                  </p>
                  <p className="text-xs text-text-muted">per night</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
