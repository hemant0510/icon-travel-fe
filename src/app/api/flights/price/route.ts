import { NextResponse } from "next/server";
import FlightService from "@/services/flightService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const flightOffer = body.flightOffer;

    if (!flightOffer) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "flightOffer is required in request body." } },
        { status: 400 }
      );
    }

    const result = await FlightService.getFlightPrice(flightOffer);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pricing failed.";
    return NextResponse.json({ error: { code: "PRICING_FAILED", message } }, { status: 500 });
  }
}
