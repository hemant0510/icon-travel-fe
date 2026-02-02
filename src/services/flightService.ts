import { z } from "zod";
import { getAmadeusClient } from "@/lib/amadeus";
import { flightSearchResponseSchema } from "@/lib/flightSchemas";
import type {
  Airport,
  FlightSearchParams,
  UnifiedFlight,
} from "@/types/flight";

const searchParamsSchema = z.object({
  origin: z.string().min(3),
  destination: z.string().min(3),
  departureDate: z.string().min(8),
  returnDate: z.string().optional(),
  adults: z.number().int().min(1).max(9),
  max: z.number().int().min(1).max(250).optional(),
});

type RetryOptions = {
  retries: number;
  baseDelayMs: number;
};

export class FlightService {
  private readonly middlewareBaseUrl?: string;
  private readonly retryOptions: RetryOptions;

  constructor(options?: { middlewareBaseUrl?: string; retryOptions?: RetryOptions }) {
    this.middlewareBaseUrl = options?.middlewareBaseUrl ?? process.env.AMADEUS_MIDDLEWARE_URL;
    this.retryOptions = options?.retryOptions ?? { retries: 3, baseDelayMs: 400 };
  }

  async searchFlights(params: FlightSearchParams): Promise<UnifiedFlight[]> {
    const parsed = searchParamsSchema.parse(params);
    const availabilityPayload = this.buildAvailabilityPayload(parsed);
    const amadeusParams = {
      originLocationCode: parsed.origin,
      destinationLocationCode: parsed.destination,
      departureDate: parsed.departureDate,
      returnDate: parsed.returnDate,
      adults: parsed.adults,
      max: parsed.max,
      currencyCode: "INR",
    };

    try {
      const availabilityResponse = await this.executeWithRetry(async () => {
        if (this.middlewareBaseUrl) {
          const result = await fetch(`${this.middlewareBaseUrl}/flights/availability`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(availabilityPayload),
            cache: "no-store",
          });
          return { status: result.status, json: await result.json() };
        }

        return this.fetchFlightAvailabilities(availabilityPayload);
      });

      if (availabilityResponse.status !== 204) {
        const normalizedResponse = flightSearchResponseSchema.parse(availabilityResponse.json);
        const flights = this.normalizeFlights(normalizedResponse);
        if (flights.length > 0) {
          return flights;
        }
      }
    } catch (error) {
      this.formatError(error);
    }

    try {
      const response = await this.executeWithRetry(async () => {
        if (this.middlewareBaseUrl) {
          const result = await fetch(`${this.middlewareBaseUrl}/flights/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(amadeusParams),
            cache: "no-store",
          });
          return { status: result.status, json: await result.json() };
        }

        const client = getAmadeusClient();
        if (!client) {
          return { status: 204, json: { data: [], dictionaries: {} } };
        }

        const result = await client.shopping.flightOffersSearch.get(amadeusParams);
        return { status: result.statusCode ?? 200, json: result.result };
      });

      if (response.status === 204) {
        return [];
      }

      const normalizedResponse = flightSearchResponseSchema.parse(response.json);
      return this.normalizeFlights(normalizedResponse);
    } catch (error) {
      throw new Error(this.formatError(error));
    }
  }

  private normalizeFlights(parsed: z.infer<typeof flightSearchResponseSchema>): UnifiedFlight[] {
    const offers = parsed.data ?? [];
    const locations = parsed.dictionaries?.locations ?? {};
    const carriers = parsed.dictionaries?.carriers ?? {};

    return offers.map((offer) => {
      const firstItinerary = offer.itineraries[0];
      const segments = firstItinerary?.segments ?? [];
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];
      const carrierCode =
        offer.validatingAirlineCodes?.[0] ??
        segments.find((segment) => segment.carrierCode)?.carrierCode;

      const originCode = firstSegment?.departure.iataCode ?? "";
      const destinationCode = lastSegment?.arrival.iataCode ?? "";
      const origin = this.toAirport(locations[originCode], originCode);
      const destination = this.toAirport(locations[destinationCode], destinationCode);

      return {
        id: offer.id,
        priceTotal: offer.price?.total ?? "N/A",
        currency: offer.price?.currency ?? "INR",
        carrierCode,
        carrierName: carrierCode ? carriers[carrierCode] : undefined,
        origin,
        destination,
        duration: firstItinerary?.duration,
        segments: segments.map((segment) => ({
          departure: segment.departure,
          arrival: segment.arrival,
          carrierCode: segment.carrierCode,
          number: segment.number,
          duration: segment.duration,
          stops: segment.numberOfStops,
        })),
      };
    });
  }

  private buildAvailabilityPayload(parsed: z.infer<typeof searchParamsSchema>) {
    const originDestinations = [
      {
        id: "1",
        originLocationCode: parsed.origin,
        destinationLocationCode: parsed.destination,
        departureDateTime: {
          date: parsed.departureDate,
          time: "09:00:00",
        },
      },
    ];

    if (parsed.returnDate) {
      originDestinations.push({
        id: "2",
        originLocationCode: parsed.destination,
        destinationLocationCode: parsed.origin,
        departureDateTime: {
          date: parsed.returnDate,
          time: "09:00:00",
        },
      });
    }

    return {
      originDestinations,
      travelers: Array.from({ length: parsed.adults }, (_, index) => ({
        id: String(index + 1),
        travelerType: "ADULT",
      })),
      sources: ["GDS"],
    };
  }

  private async fetchFlightAvailabilities(payload: {
    originDestinations: Array<{
      id: string;
      originLocationCode: string;
      destinationLocationCode: string;
      departureDateTime: { date: string; time: string };
    }>;
    travelers: Array<{ id: string; travelerType: string }>;
    sources: string[];
  }) {
    const token = await this.getAccessToken();
    if (!token) {
      return { status: 204, json: { data: [], dictionaries: {} } };
    }

    const baseUrl = this.getAmadeusBaseUrl();
    const response = await fetch(`${baseUrl}/v1/shopping/availability/flight-availabilities`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.amadeus+json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    return { status: response.status, json: await response.json() };
  }

  private getAmadeusBaseUrl() {
    const hostname =
      process.env.AMADEUS_HOSTNAME ??
      (process.env.NODE_ENV === "development" ? "test" : "production");

    if (hostname === "production" || hostname === "prod") {
      return "https://api.amadeus.com";
    }

    if (hostname.startsWith("http")) {
      return hostname;
    }

    return `https://${hostname}.api.amadeus.com`;
  }

  private async getAccessToken() {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return null;
    }

    const response = await fetch(`${this.getAmadeusBaseUrl()}/v1/security/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as { access_token?: string };
    if (!response.ok || !data.access_token) {
      throw new Error("Amadeus access token request failed.");
    }

    return data.access_token;
  }

  private toAirport(raw: { name?: string; cityName?: string; countryCode?: string } | undefined, iataCode: string): Airport {
    const safeRaw = raw ?? {};
    return {
      iataCode,
      name: safeRaw.name,
      city: safeRaw.cityName,
      country: safeRaw.countryCode,
    };
  }

  private async executeWithRetry<T>(fn: () => Promise<T & { status: number }>): Promise<T> {
    const { retries, baseDelayMs } = this.retryOptions;
    let attempt = 0;

    while (true) {
      const result = await fn();
      if (result.status !== 429 || attempt >= retries) {
        return result;
      }
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (error && typeof error === "object") {
      const record = error as Record<string, unknown>;
      const description = typeof record.description === "string" ? record.description : undefined;
      const code = typeof record.code === "string" ? record.code : undefined;
      const response = record.response as Record<string, unknown> | undefined;
      const responseErrors = Array.isArray(response?.errors) ? response?.errors : undefined;
      const responseMessage = responseErrors
        ?.map((entry) =>
          typeof entry?.detail === "string" ? entry.detail : typeof entry?.title === "string" ? entry.title : ""
        )
        .filter((value) => value.length > 0)
        .join(", ");

      return [description, responseMessage, code].filter(Boolean).join(" | ") || "Amadeus request failed.";
    }

    return "Amadeus request failed.";
  }
}
