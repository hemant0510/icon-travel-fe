"use server";

import FlightService from "@/services/flightService";
import { mapOffersToUnified } from "@/lib/mappers";
import type { UnifiedFlight } from "@/types/flight";

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
  const tripType = String(formData.get("tripType") ?? "one-way");
  const returnDate = tripType === "round-trip"
    ? (String(formData.get("returnDate") ?? "") || undefined)
    : undefined;
  const adultsValue = Number(formData.get("adults") ?? 1);
  const maxValue = Number(formData.get("max") ?? 25);
  const currencyCode = String(formData.get("currencyCode") ?? "INR");

  if (!origin || !destination || origin.length !== 3 || destination.length !== 3) {
    return { status: "error", flights: [], error: "Select a valid origin and destination." };
  }

  if (origin === destination) {
    return { status: "error", flights: [], error: "Origin and destination must differ." };
  }

  if (!departureDate) {
    return { status: "error", flights: [], error: "Departure date is required." };
  }

  if (tripType === "round-trip" && !returnDate) {
    return { status: "error", flights: [], error: "Return date is required for round trips." };
  }

  try {
    const response = await FlightService.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults: Number.isFinite(adultsValue) && adultsValue > 0 ? adultsValue : 1,
      max: Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 25,
      currencyCode,
    });

    const flights = mapOffersToUnified(response);
    return { status: "success", flights };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return { status: "error", flights: [], error: message };
  }
}
