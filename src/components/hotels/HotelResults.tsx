"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Hotel } from "@/types/hotel";
import { useHotelStore } from "@/store/useHotelStore";
import { Star, MapPin, Wifi, Waves, Dumbbell, UtensilsCrossed, Loader2, AlertCircle } from "lucide-react";

type CurrencyRates = Record<string, number>;

const DEFAULT_CURRENCY = "INR";

const formatCurrency = (amount: number, currencyCode: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: currencyCode }).format(amount);

const convertCurrencyAmount = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: CurrencyRates
) => {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];
  if (!fromRate || !toRate) return amount;
  return (amount / fromRate) * toRate;
};

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={12} />,
  Pool: <Waves size={12} />,
  Gym: <Dumbbell size={12} />,
  Restaurant: <UtensilsCrossed size={12} />,
};

export type HotelResultsProps = {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  initialCurrency?: string;
  rates?: CurrencyRates | null;
  searchParams?: {
    cityCode: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    currency?: string;
  };
};

export default function HotelResults({ hotels, loading, error, initialCurrency, rates, searchParams }: HotelResultsProps) {
  const filters = useHotelStore(s => s.filters);
  const sortBy = useHotelStore(s => s.sortBy);
  const destination = useHotelStore(s => s.destination);
  const urlSearchParams = useSearchParams();

  const displayCurrency = initialCurrency || DEFAULT_CURRENCY;

  const filteredHotels = useMemo(() => {
    const result = hotels.filter((hotel) => {
      const priceInUserCurrency = rates
        ? convertCurrencyAmount(hotel.pricePerNight, hotel.currency, displayCurrency, rates)
        : hotel.pricePerNight;

      const withinPrice =
        priceInUserCurrency >= filters.priceRange[0] &&
        priceInUserCurrency <= filters.priceRange[1];

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

    switch (sortBy) {
      case "PRICE_LOW_HIGH":
        return result.sort((a, b) => {
          const priceA = rates
            ? convertCurrencyAmount(a.pricePerNight, a.currency, displayCurrency, rates)
            : a.pricePerNight;
          const priceB = rates
            ? convertCurrencyAmount(b.pricePerNight, b.currency, displayCurrency, rates)
            : b.pricePerNight;
          return priceA - priceB;
        });
      case "PRICE_HIGH_LOW":
        return result.sort((a, b) => {
          const priceA = rates
            ? convertCurrencyAmount(a.pricePerNight, a.currency, displayCurrency, rates)
            : a.pricePerNight;
          const priceB = rates
            ? convertCurrencyAmount(b.pricePerNight, b.currency, displayCurrency, rates)
            : b.pricePerNight;
          return priceB - priceA;
        });
      case "RATING_HIGH_LOW":
        return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "RECOMMENDED":
      default:
        return result;
    }
  }, [hotels, filters, destination, rates, displayCurrency, sortBy]);

  if (loading) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary-600" size={40} />
        <p className="text-text-secondary">Finding the best hotels for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <p>{error}</p>
      </div>
    );
  }

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
      {filteredHotels.map((hotel, i) => {
        const convertedPrice = rates
          ? convertCurrencyAmount(hotel.pricePerNight, hotel.currency, displayCurrency, rates)
          : hotel.pricePerNight;

        const finalCurrency = rates ? displayCurrency : hotel.currency;
        
        // Build query string for the detail page using passed searchParams if available, otherwise fallback to URL params
        const queryParams = new URLSearchParams();
        
        if (searchParams) {
            queryParams.set('checkIn', searchParams.checkIn);
            queryParams.set('checkOut', searchParams.checkOut);
            queryParams.set('guests', searchParams.guests.toString());
            queryParams.set('rooms', searchParams.rooms.toString());
            queryParams.set('currency', searchParams.currency || finalCurrency);
        } else {
             // Fallback to reading from URL if explicit params not passed
             urlSearchParams.forEach((value, key) => {
                 queryParams.set(key, value);
             });
        }

        // Ensure currency is set
        if (!queryParams.has('currency')) {
            queryParams.set('currency', finalCurrency);
        }

        return (
          <Link
            key={hotel.id}
            href={`/hotels/${hotel.id}?${queryParams.toString()}`}
            className="block"
          >
            <article
              className="glass-card overflow-hidden transition-all duration-300 hover:glass-card-hover animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-48 w-full overflow-hidden sm:h-auto sm:w-56 sm:min-h-[200px]">
                  {hotel.image ? (
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-400 to-accent-400">
                      <MapPin className="text-white/50" size={40} />
                    </div>
                  )}
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
                      <span className={`rounded-lg px-2 py-1 text-xs font-bold text-white ${hotel.rating > 0 ? 'bg-primary-600' : 'bg-gray-400'}`}>
                        {hotel.rating > 0 ? hotel.rating : "New"}
                      </span>
                      <span className="text-xs text-text-muted">
                        ({hotel.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-700">
                        {formatCurrency(convertedPrice, finalCurrency)}
                      </p>
                      <p className="text-xs text-text-muted">per night</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
