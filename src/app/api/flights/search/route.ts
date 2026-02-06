import { NextResponse } from "next/server";
import FlightService from "@/services/flightService";
import { FlightSearchRequest } from "@/models/requests/FlightSearchRequest";
import { mapAmadeusToUnified } from "@/lib/mappers";
import type { FlightSearchParams } from "@/types/flight";

export async function POST(request: Request) {
  const payload = (await request.json()) as FlightSearchParams;

  const apiRequest: FlightSearchRequest = {
    originDestinations: [
      {
        id: "1",
        originLocationCode: payload.origin,
        destinationLocationCode: payload.destination,
        departureDateTimeRange: {
          date: payload.departureDate
        }
      }
    ],
    travelers: [{ id: "1", travelerType: "ADULT" }],
    sources: ["GDS"]
  };

  // Basic handling for return date if exists in payload
  if (payload.returnDate) {
    apiRequest.originDestinations.push({
      id: "2",
      originLocationCode: payload.destination,
      destinationLocationCode: payload.origin,
      departureDateTimeRange: {
        date: payload.returnDate
      }
    });
  }

  try {
    const response = await FlightService.searchFlights(apiRequest);
    const flights = mapAmadeusToUnified(response);
    return NextResponse.json({ flights });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
