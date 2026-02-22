"use client";

import { useSearchParams } from "next/navigation";
import { useHotelDetail } from "@/hooks/useHotelDetail";
import { Loader2, MapPin, Star, Wifi, Waves, Dumbbell, UtensilsCrossed, Calendar, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={16} />,
  Pool: <Waves size={16} />,
  Gym: <Dumbbell size={16} />,
  Restaurant: <UtensilsCrossed size={16} />,
};

export default function HotelDetailContent({ hotelId }: { hotelId: string }) {
  const searchParams = useSearchParams();
  
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const adults = Number(searchParams.get("guests")) || 1; // Note: 'guests' in URL vs 'adults' in API
  const rooms = Number(searchParams.get("rooms")) || 1;
  const currency = searchParams.get("currency") || "INR";

  const { hotel, loading, error } = useHotelDetail(hotelId, {
    checkIn,
    checkOut,
    adults,
    rooms,
    currency
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2 text-text-secondary">{error || "Hotel not found"}</p>
        <Link href="/hotels" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to Hotels
        </Link>
      </div>
    );
  }

  const mainImage = selectedImage || hotel.image || hotel.thumbnailImages?.[0];
  const galleryImages = hotel.images || hotel.thumbnailImages || [];

  return (
    <div className="min-h-screen bg-background-light pb-20 pt-24">
      <div className="container mx-auto px-4">
        {/* Breadcrumb / Back */}
        <Link href={`/hotels?${searchParams.toString()}`} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary-600">
          <ArrowLeft size={16} />
          Back to Search Results
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="mb-2 text-3xl font-bold text-text-primary">{hotel.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-accent-400 text-accent-400" />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{hotel.fullAddress || `${hotel.city}, ${hotel.country}`}</span>
                </div>
                {hotel.rating > 0 && (
                   <div className="flex items-center gap-1">
                     <span className="rounded bg-primary-600 px-1.5 py-0.5 text-xs font-bold text-white">
                       {hotel.rating}
                     </span>
                     <span>({hotel.reviewCount} reviews)</span>
                   </div>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative h-[400px] w-full bg-gray-100">
                {mainImage ? (
                  <img src={mainImage} alt={hotel.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-text-muted">
                    <MapPin size={48} />
                  </div>
                )}
              </div>
              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                        selectedImage === img ? "border-primary-600" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-text-primary">About this hotel</h2>
              <p className="leading-relaxed text-text-secondary">{hotel.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-text-primary">Amenities</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {hotel.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-text-secondary">
                    {amenityIcons[amenity] || <div className="h-4 w-4 rounded-full bg-primary-100" />}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews (Placeholder for now as we might not have full review text from basic mapping) */}
            {hotel.reviews && hotel.reviews.length > 0 && (
              <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-text-primary">Guest Reviews</h2>
                <div className="space-y-4">
                  {hotel.reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-border-light pb-4 last:border-0 last:pb-0">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {review.profilePhotoUrl && (
                            <img src={review.profilePhotoUrl} alt={review.authorName} className="h-8 w-8 rounded-full" />
                          )}
                          <span className="font-medium text-text-primary">{review.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-text-muted">
                          <Star size={12} className="fill-accent-400 text-accent-400" />
                          <span>{review.rating}</span>
                          <span>• {review.relativeTime}</span>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg border border-border-light">
              <div className="mb-6">
                <p className="text-sm text-text-muted">Price starts from</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary-700">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: hotel.currency }).format(hotel.pricePerNight)}
                  </span>
                  <span className="text-text-secondary">/ night</span>
                </div>
                <p className="mt-1 text-xs text-green-600">Includes taxes & fees</p>
              </div>

              <div className="mb-6 space-y-3 rounded-xl bg-background-light p-4 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <Calendar size={14} /> Check-in
                  </span>
                  <span className="font-medium text-text-primary">{checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <Calendar size={14} /> Check-out
                  </span>
                  <span className="font-medium text-text-primary">{checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <Users size={14} /> Guests
                  </span>
                  <span className="font-medium text-text-primary">{adults} Adults, {rooms} Room</span>
                </div>
              </div>

              {hotel.cancellationPolicy && (
                <div className="mb-6 text-xs text-text-secondary">
                  <p className="font-medium text-text-primary mb-1">Cancellation Policy:</p>
                  <p>{hotel.cancellationPolicy}</p>
                </div>
              )}

              <button className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:shadow-primary-600/30 active:scale-[0.98]">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
