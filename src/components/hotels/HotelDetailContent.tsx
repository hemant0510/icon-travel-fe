"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHotelDetail } from "@/hooks/useHotelDetail";
import { Star, MapPin, ChevronLeft, ChevronRight, Wifi, Waves, Dumbbell, UtensilsCrossed } from "lucide-react";
import type { Hotel } from "@/types/hotel";

export type HotelDetailContentProps = {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  currency?: string;
};

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={20} />,
  Pool: <Waves size={20} />,
  Gym: <Dumbbell size={20} />,
  Restaurant: <UtensilsCrossed size={20} />,
};

const formatCurrency = (amount: number, currencyCode: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: currencyCode }).format(amount);

export default function HotelDetailContent({
  hotelId,
  checkIn,
  checkOut,
  adults,
  rooms,
  currency,
}: HotelDetailContentProps) {
  const { hotel, loading, error } = useHotelDetail(hotelId, {
    checkIn,
    checkOut,
    adults,
    rooms,
    currency,
  });

  const [mainImageIndex, setMainImageIndex] = useState(0);

  // FIXED: Reset image index when hotel changes
  useEffect(() => {
    setMainImageIndex(0);
  }, [hotelId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light pb-20 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-background-light pb-20 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || "Hotel not found"}</p>
        </div>
      </div>
    );
  }

  // FIXED: Proper null safety and bounds checking
  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.image || ""];
  const safeImageIndex = Math.min(mainImageIndex, images.length - 1);
  const currentImage = images[safeImageIndex] || "";

  const handlePrevImage = () => {
    setMainImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setMainImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-background-light pb-20 pt-24">
      {/* Back Link */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/hotels" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary-600">
          <ChevronLeft size={16} />
          Back to hotels
        </Link>
      </div>

      {/* Main Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2">
            {/* Header Block */}
            <div className="mb-6">
              <h1 className="mb-2 text-3xl font-bold text-text-primary">{hotel.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} size={16} className="fill-accent-400 text-accent-400" />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{hotel.city}, {hotel.country}</span>
                </div>
                <div className="rounded-lg bg-primary-50 px-2.5 py-1 font-medium text-primary-600">
                  {hotel.rating > 0 ? `${hotel.rating} (${hotel.reviewCount.toLocaleString()} reviews)` : "New"}
                </div>
              </div>
            </div>

            {/* Hero Section - Image Gallery */}
            <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative aspect-video overflow-hidden bg-gray-200">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={hotel.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-400 to-accent-400">
                    <MapPin className="text-white/50" size={48} />
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} className="text-text-primary" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} className="text-text-primary" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Carousel */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-border-light bg-white p-4">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImageIndex(i)}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        i === safeImageIndex ? "border-primary-600" : "border-border-light"
                      }`}
                    >
                      <img
                        src={img || ""}
                        alt={`${hotel.name} - ${i}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8 overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-text-primary">About this hotel</h2>
              <p className="leading-relaxed text-text-secondary">{hotel.description}</p>
            </div>

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="mb-8 overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-text-primary">Amenities</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {hotel.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 rounded-lg bg-background-light p-3">
                      <div className="flex-shrink-0 text-primary-600">
                        {amenityIcons[amenity] || <Wifi size={20} />}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {hotel.reviews && hotel.reviews.length > 0 && (
              <div className="mb-8 overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-text-primary">Guest Reviews</h2>
                <div className="space-y-4">
                  {hotel.reviews.slice(0, 5).map((review, i) => (
                    <div key={i} className="border-b border-border-light pb-4 last:border-b-0">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-text-primary">{review.authorName}</p>
                          <p className="text-xs text-text-muted">{review.relativeTime}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: Math.round(review.rating) }).map((_, i) => (
                            <Star key={i} size={14} className="fill-accent-400 text-accent-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-text-secondary">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-border-light bg-white p-6 shadow-lg">
              {/* Price Section */}
              <div className="mb-6 border-b border-border-light pb-6">
                <p className="text-sm text-text-secondary">Price per night</p>
                <p className="text-3xl font-bold text-primary-700">
                  {formatCurrency(hotel.pricePerNight, hotel.currency)}
                </p>
              </div>

              {/* Trip Details */}
              <div className="mb-6 space-y-3 rounded-xl bg-background-light p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Check-in</span>
                  <span className="font-medium text-text-primary">{checkIn}</span>
                </div>
                <div className="flex justify-between border-t border-border-light pt-3">
                  <span className="text-text-secondary">Check-out</span>
                  <span className="font-medium text-text-primary">{checkOut}</span>
                </div>
                <div className="flex justify-between border-t border-border-light pt-3">
                  <span className="text-text-secondary">Guests</span>
                  <span className="font-medium text-text-primary">{adults}</span>
                </div>
                <div className="flex justify-between border-t border-border-light pt-3">
                  <span className="text-text-secondary">Rooms</span>
                  <span className="font-medium text-text-primary">{rooms}</span>
                </div>
              </div>

              {/* Cancellation Policy */}
              {hotel.cancellationPolicy && (
                <div className="mb-6 rounded-xl border border-border-light p-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-text-secondary">Cancellation Policy</p>
                  <p className="text-sm leading-relaxed text-text-primary">{hotel.cancellationPolicy}</p>
                </div>
              )}

              {/* CTA Button */}
              <button className="w-full rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
