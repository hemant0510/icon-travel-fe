import { NextResponse } from "next/server";
import HotelService from "@/services/hotelService";
import GooglePlacesService from "@/services/googlePlacesService";
import { buildHotelMetaMap, mapHotelOffersResponse } from "@/lib/mappers/hotelMapper";
import { mapGooglePlaceDetailsToHotel } from "@/lib/mappers/googlePlacesMapper";
import type { Hotel } from "@/types/hotel";

async function enrichWithGooglePlaces(hotel: Hotel): Promise<Hotel> {
  if (!hotel.name) return hotel;

  // Use latitude/longitude to bias the search if available
  const placeId = await GooglePlacesService.findPlaceId(hotel.name, hotel.latitude, hotel.longitude);
  if (!placeId) return hotel;

  // Fetch limited details for the list view
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
    // Use the first image as the main image if available
    image: mappedDetails.thumbnailImages?.[0] || hotel.image,
  };
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

    // 1. Call Amadeus hotel search API
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

    // 2. Enrich with Google Places data (in parallel)
    // Limit concurrency if needed, but for now Promise.all is acceptable for typical page sizes (e.g. 10-20)
    // If Amadeus returns 50, we might want to slice it or accept the latency.
    // For "lightweight" list, maybe we limit to top 20?
    const hotelsToEnrich = initialHotels.slice(0, 20); // Optimization: only process top 20
    
    const enrichedHotels = await Promise.all(
      hotelsToEnrich.map(hotel => enrichWithGooglePlaces(hotel))
    );

    // If there are more than 20, append the rest without enrichment
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
