import { NextResponse } from "next/server";
import HotelService from "@/services/hotelService";
import { buildHotelMetaMap, mapHotelOffersResponse } from "@/lib/mappers/hotelMapper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cityCode, checkIn, checkOut, guests, rooms, currency } = body;

    if (!cityCode || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required parameters: cityCode, checkIn, checkOut" } },
        { status: 400 }
      );
    }

    const rawResult = await HotelService.searchHotels({
      cityCode,
      checkIn,
      checkOut,
      adults: guests || 1,
      rooms: rooms || 1,
      currency,
    });

    const hotelMeta = buildHotelMetaMap(rawResult.hotelList.data || []);
    const hotels = mapHotelOffersResponse(rawResult.hotelOffers.data || [], hotelMeta);

    return NextResponse.json({ hotels });
  } catch (error) {
    console.error("Hotel search API error:", error);
    const message = error instanceof Error ? error.message : "Failed to search hotels";
    return NextResponse.json(
      { error: { code: "SEARCH_FAILED", message } },
      { status: 500 }
    );
  }
}
