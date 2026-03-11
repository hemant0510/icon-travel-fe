import { NextRequest, NextResponse } from "next/server";
import FlightService from "@/services/flightService";
import type { PricedFlightOffer } from "@/types/flight";

/**
 * POST /api/flights/detail
 * Body: { rawOffer: Record<string, unknown> }
 *
 * Accepts a raw Amadeus flight offer (stored in UnifiedFlight.rawOffer),
 * calls the Amadeus Flight Offers Price API to get the full fare breakdown,
 * and returns the enriched PricedFlightOffer.
 *
 * This is the data source for the Flight Detail page.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawOffer } = body as { rawOffer: Record<string, unknown> };

    if (!rawOffer) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required body field: rawOffer" } },
        { status: 400 }
      );
    }

    const pricingResponse = await FlightService.getPricedOffer(rawOffer);

    // Amadeus pricing response shape: { data: { flightOffers: [...], ... } }
    const data = pricingResponse.data as Record<string, unknown> | undefined;
    const flightOffers = (data?.flightOffers ?? []) as PricedFlightOffer[];
    const pricedOffer: PricedFlightOffer | null = flightOffers[0] ?? null;

    return NextResponse.json({ pricedOffer });
  } catch (error) {
    console.error("FlightDetail API:", error);
    
    // Proper error categorization
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Authentication errors
      if (message.includes('unauthorized') || message.includes('invalid credentials')) {
        return NextResponse.json(
          { error: { code: "AUTH_ERROR", message: "Authentication failed" } },
          { status: 401 }
        );
      }
      
      // Validation errors from Amadeus
      if (message.includes('400') || message.includes('invalid format') || message.includes('validation')) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Invalid flight offer data" } },
          { status: 400 }
        );
      }
      
      // Rate limiting
      if (message.includes('429') || message.includes('rate limit')) {
        return NextResponse.json(
          { error: { code: "RATE_LIMIT", message: "Too many requests. Please try again later." } },
          { status: 429 }
        );
      }
      
      // Server errors from Amadeus
      if (message.includes('500') || message.includes('502') || message.includes('503')) {
        return NextResponse.json(
          { error: { code: "UPSTREAM_ERROR", message: "Flight pricing service temporarily unavailable" } },
          { status: 503 }
        );
      }
    }
    
    // Generic error
    const message = error instanceof Error ? error.message : "Failed to fetch flight details";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
