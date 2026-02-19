import { NextResponse } from "next/server";
import TransferService from "@/services/transferService";
import { mapTransferOffersResponse } from "@/lib/mappers/transferMapper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      startLocationCode,
      endAddressLine,
      endCityName,
      endZipCode,
      endCountryCode,
      endName,
      endGeoCode,
      transferType,
      startDateTime,
      passengers,
    } = body;

    if (!startLocationCode || !endGeoCode || !startDateTime) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required parameters: startLocationCode, endGeoCode, startDateTime" } },
        { status: 400 }
      );
    }

    const rawResult = await TransferService.searchTransfers({
      startLocationCode,
      endAddressLine: endAddressLine || "",
      endCityName: endCityName || "",
      endZipCode: endZipCode || "",
      endCountryCode: endCountryCode || "",
      endName: endName || "",
      endGeoCode,
      transferType: transferType || "PRIVATE",
      startDateTime,
      passengers: passengers || 1,
    });

    const vehicles = mapTransferOffersResponse(rawResult.data || []);

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("Transfer search API error:", error);
    const message = error instanceof Error ? error.message : "Failed to search transfers";
    return NextResponse.json(
      { error: { code: "SEARCH_FAILED", message } },
      { status: 500 }
    );
  }
}
