"use server";

import FlightService from "@/services/flightService";
import { FlightSearchRequest } from "@/models/requests/FlightSearchRequest";
import { mapAmadeusToUnified } from "@/lib/mappers";
import type { FlightSearchParams, UnifiedFlight } from "@/types/flight";

export type FlightSearchState = {
  status: "idle" | "success" | "error";
  flights: UnifiedFlight[];
  error?: string;
};

export async function searchFlightsAction(
  _previousState: FlightSearchState,
  formData: FormData
): Promise<FlightSearchState> {
  const origin = String(formData.get("origin") ?? "").toUpperCase();
  const destination = String(formData.get("destination") ?? "").toUpperCase();
  const departureDate = String(formData.get("departureDate") ?? "");
  const returnDate = String(formData.get("returnDate") ?? "") || undefined;
  const adultsValue = Number(formData.get("adults") ?? 1);
  const maxValue = Number(formData.get("max") ?? 25);

  if (!origin || !destination || origin.length !== 3 || destination.length !== 3) {
    return { status: "error", flights: [], error: "Select a valid origin and destination." };
  }

  if (origin === destination) {
    return { status: "error", flights: [], error: "Origin and destination must differ." };
  }

  const searchParams: FlightSearchParams = {
    origin,
    destination,
    departureDate,
    returnDate,
    adults: Number.isFinite(adultsValue) && adultsValue > 0 ? adultsValue : 1,
    max: Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 25,
  };

  /* 
   * Construct FlightSearchRequest from formData
   * Note: This assumes simplified one-way logic for the MVP mapping.
   * Round-trip would require two OriginDestinations.
   */
  const request: FlightSearchRequest = {
    originDestinations: [
      {
        id: "1",
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDateTimeRange: {
          date: departureDate
        }
      }
    ],
    travelers: [
      { id: "1", travelerType: "ADULT" } // Defaulting traveler for now
    ],
    sources: ["GDS"]
  };

  if (returnDate) {
    request.originDestinations.push({
      id: "2",
      originLocationCode: destination,
      destinationLocationCode: origin,
      departureDateTimeRange: {
        date: returnDate
      }
    });
  }

  // Adults handling - typically added to travelers array
  if (adultsValue > 1) {
    for (let i = 2; i <= adultsValue; i++) {
      request.travelers.push({ id: i.toString(), travelerType: "ADULT" });
    }
  }

  try {
    const response = await FlightService.searchFlights(request);
    const flights = mapAmadeusToUnified(response);
    return { status: "success", flights };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return { status: "error", flights: [], error: message };
  }
}
