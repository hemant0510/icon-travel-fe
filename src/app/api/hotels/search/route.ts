import { NextResponse } from "next/server";
import HotelService from "@/services/hotelService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cityCode, checkIn, checkOut, guests, rooms, currency } = body;

    if (!cityCode || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const hotels = await HotelService.searchHotels({
      cityCode,
      checkIn,
      checkOut,
      adults: guests || 1,
      rooms: rooms || 1,
      currency
    });

    return NextResponse.json({ hotels });
  } catch (error) {
    console.error("Hotel search API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to search hotels";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
