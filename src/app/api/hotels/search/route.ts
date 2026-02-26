import { NextResponse } from "next/server";
import HotelService from "@/services/hotelService";
import GooglePlacesService from "@/services/googlePlacesService";
import { buildHotelMetaMap, mapHotelOffersResponse } from "@/lib/mappers/hotelMapper";
import { mapGooglePlaceDetailsToHotel } from "@/lib/mappers/googlePlacesMapper";
import type { Hotel } from "@/types/hotel";

async function enrichWithGooglePlaces(hotel: Hotel): Promise<Hotel> {
  if (!hotel.name) return hotel;

  const placeId = await GooglePlacesService.findPlaceId(
    hotel.name,
    hotel.city,
    hotel.country,
    hotel.latitude,
    hotel.longitude
  );
  if (!placeId) return hotel;

  const details = await GooglePlacesService.getPlaceDetails(placeId, [
    'photos',
    'rating',
    'user_ratings_total',
    'formatted_address'
  ]);
  
  if (!details) return hotel;

  const mappedDetails = mapGooglePlaceDetailsToHotel(details);

  return {
    ...hotel,
    rating: mappedDetails.rating > 0 ? mappedDetails.rating : hotel.rating,
    reviewCount: mappedDetails.reviewCount > 0 ? mappedDetails.reviewCount : hotel.reviewCount,
    thumbnailImages: mappedDetails.thumbnailImages,
    shortAddress: mappedDetails.shortAddress,
    image: mappedDetails.thumbnailImages?.[0] || hotel.image,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const results = new Array<R>(items.length);
  let index = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current]);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cityCode, checkIn, checkOut, guests, rooms, currency } = body;

    if (!cityCode || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required parameters: cityCode, checkIn, checkOut" } },
        { status: 400 }
      );
    }

    const rawResult = await HotelService.searchHotels({
      cityCode,
      checkIn,
      checkOut,
      adults: guests || 1,
      rooms: rooms || 1,
      currency,
    });

    const hotelMeta = buildHotelMetaMap(rawResult.hotelList.data || []);
    const initialHotels = mapHotelOffersResponse(rawResult.hotelOffers.data || [], hotelMeta);

    const hotelsToEnrich = initialHotels.slice(0, 20);
    
    const enrichedHotels = await mapWithConcurrency(hotelsToEnrich, 4, enrichWithGooglePlaces);

    const remainingHotels = initialHotels.slice(20);
    const finalHotels = [...enrichedHotels, ...remainingHotels];

    return NextResponse.json({ hotels: finalHotels });
  } catch (error) {
    console.error("Hotel search API error:", error);
    const message = error instanceof Error ? error.message : "Failed to search hotels";
    return NextResponse.json(
      { error: { code: "SEARCH_FAILED", message } },
      { status: 500 }
    );
  }
}
