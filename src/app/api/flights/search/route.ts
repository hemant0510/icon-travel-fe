import { NextResponse } from "next/server";
import { FlightService } from "@/services/flightService";
import type { FlightSearchParams } from "@/types/flight";

const service = new FlightService();

export async function POST(request: Request) {
  const payload = (await request.json()) as FlightSearchParams;

  try {
    const flights = await service.searchFlights(payload);
    return NextResponse.json({ flights });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
