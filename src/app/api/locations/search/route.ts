import { NextRequest, NextResponse } from "next/server";
import LocationService from "@/services/locationService";

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword");

  if (!keyword || keyword.length < 3) {
    return NextResponse.json({ data: [] });
  }

  try {
    const response = await LocationService.searchCity(keyword);
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Location search failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
