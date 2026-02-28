import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");
  const maxWidth = searchParams.get("maxWidth") || "400";
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!ref) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Missing photo reference" } },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: { code: "CONFIG_ERROR", message: "Missing GOOGLE_PLACES_API_KEY" } },
      { status: 500 }
    );
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/photo");
  url.searchParams.append("maxwidth", maxWidth);
  url.searchParams.append("photo_reference", ref);
  url.searchParams.append("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    return NextResponse.json(
      { error: { code: "PHOTO_FETCH_FAILED", message: "Failed to fetch photo" } },
      { status: response.status }
    );
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
