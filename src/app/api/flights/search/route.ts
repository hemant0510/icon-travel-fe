import { NextResponse } from "next/server";
import FlightService from "@/services/flightService";
import { mapFlightOffersResponse } from "@/lib/mappers/flightMapper";
import type { FlightSearchParams } from "@/types/flight";

export async function POST(request: Request) {
  const payload = (await request.json()) as FlightSearchParams;

  try {
    const response = await FlightService.searchFlights({
      origin: payload.origin,
      destination: payload.destination,
      departureDate: payload.departureDate,
      returnDate: payload.returnDate,
      adults: payload.adults,
      max: payload.max,
      currencyCode: payload.currencyCode,
    });

    const flights = mapFlightOffersResponse(response);
    return NextResponse.json({ flights });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ error: { code: "SEARCH_FAILED", message } }, { status: 500 });
  }
}
