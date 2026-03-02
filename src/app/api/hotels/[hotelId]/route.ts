import { NextResponse } from "next/server";
import HotelService from "@/services/hotelService";
import GooglePlacesService from "@/services/googlePlacesService";
import { mapHotelOffersResponse } from "@/lib/mappers/hotelMapper";
import { mapGooglePlaceDetailsToHotel } from "@/lib/mappers/googlePlacesMapper";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  try {
    const { hotelId } = await params;
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adults = Number(searchParams.get("adults")) || 1;
    const rooms = Number(searchParams.get("rooms")) || 1;
    const currency = searchParams.get("currency") || "USD";

    if (!hotelId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required parameters: checkIn, checkOut" } },
        { status: 400 }
      );
    }

    try {
      // 1. Get Hotel Offer from Amadeus
      const offersResponse = await HotelService.getHotelOffer({
        hotelId,
        checkIn,
        checkOut,
        adults,
        rooms,
        currency,
      });

      if (!offersResponse.data || offersResponse.data.length === 0) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Hotel not found or no offers available" } },
          { status: 404 }
        );
      }

      // Map the response
      const hotels = mapHotelOffersResponse(offersResponse.data, new Map());
      const hotel = hotels[0];

      // 2. Enrich with full Google Places details
      if (hotel.name) {
        try {
          const placeId = await GooglePlacesService.findPlaceId(
            hotel.name,
            hotel.city,
            hotel.country,
            hotel.latitude,
            hotel.longitude
          );
          
          if (placeId) {
            // Fetch full details for the detail page
            const details = await GooglePlacesService.getPlaceDetails(placeId, [
              'name',
              'rating',
              'user_ratings_total',
              'formatted_address',
              'photos',
              'reviews',
              'geometry',
              'website',
              'formatted_phone_number',
              'url'
            ]);

            if (details) {
              const mappedDetails = mapGooglePlaceDetailsToHotel(details);
              
              // Merge
              Object.assign(hotel, {
                rating: mappedDetails.rating > 0 ? mappedDetails.rating : hotel.rating,
                reviewCount: mappedDetails.reviewCount > 0 ? mappedDetails.reviewCount : hotel.reviewCount,
                images: mappedDetails.images,
                thumbnailImages: mappedDetails.thumbnailImages,
                fullAddress: mappedDetails.fullAddress,
                shortAddress: mappedDetails.shortAddress,
                reviews: mappedDetails.reviews,
                bookingLink: mappedDetails.website,
              });
            }
          }
        } catch (googleError) {
          console.warn("Google Places enrichment failed:", googleError);
          // Continue without enrichment
        }
      }

      return NextResponse.json({ hotel });
    } catch (amadeusError: unknown) {
      // Check if it's an API error from Amadeus
      const errorMessage = amadeusError instanceof Error ? amadeusError.message : "Unknown error";
      if (errorMessage.includes("400") || errorMessage.includes("INVALID_FORMAT")) {
         return NextResponse.json(
          { error: { code: "INVALID_REQUEST", message: "Invalid search parameters or hotel ID." } },
          { status: 400 }
        );
      }
      throw amadeusError;
    }

  } catch (error) {
    console.error("Hotel detail API error:", error);
    
    // Proper error categorization
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Authentication errors
      if (message.includes('unauthorized') || message.includes('invalid credentials') || message.includes('401')) {
        return NextResponse.json(
          { error: { code: 'AUTH_ERROR', message: 'Authentication failed' } },
          { status: 401 }
        );
      }
      
      // Validation errors
      if (message.includes('400') || message.includes('invalid_format') || message.includes('validation')) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Invalid hotel search parameters' } },
          { status: 400 }
        );
      }
      
      // Hotel not found
      if (message.includes('404') || message.includes('not found')) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Hotel not found' } },
          { status: 404 }
        );
      }
      
      // Rate limiting
      if (message.includes('429') || message.includes('rate limit')) {
        return NextResponse.json(
          { error: { code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' } },
          { status: 429 }
        );
      }
      
      // Upstream server errors
      if (message.includes('500') || message.includes('502') || message.includes('503')) {
        return NextResponse.json(
          { error: { code: 'UPSTREAM_ERROR', message: 'Hotel service temporarily unavailable' } },
          { status: 503 }
        );
      }
    }
    
    const message = error instanceof Error ? error.message : "Failed to fetch hotel details";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
