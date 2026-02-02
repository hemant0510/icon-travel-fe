"use server";

import { FlightService } from "@/services/flightService";
import type { FlightSearchParams, UnifiedFlight } from "@/types/flight";

export type FlightSearchState = {
  status: "idle" | "success" | "error";
  flights: UnifiedFlight[];
  error?: string;
};

const service = new FlightService();

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

  try {
    const flights = await service.searchFlights(searchParams);
    return { status: "success", flights };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return { status: "error", flights: [], error: message };
  }
}
