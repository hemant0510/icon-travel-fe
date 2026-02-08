import type { FlightOffersResponse, FlightOfferData, OfferSegment } from '../models/responses/FlightSearchResponse';
import type { UnifiedFlight, FlightSegment, FlightItinerary } from '../types/flight';

function mapSegments(segments: OfferSegment[]): FlightSegment[] {
    return segments.map((seg) => ({
        departure: {
            iataCode: seg.departure.iataCode,
            at: seg.departure.at
        },
        arrival: {
            iataCode: seg.arrival.iataCode,
            at: seg.arrival.at
        },
        carrierCode: seg.carrierCode,
        number: seg.number,
        duration: seg.duration,
        stops: seg.numberOfStops
    }));
}

export function mapOffersToUnified(response: FlightOffersResponse): UnifiedFlight[] {
    if (!response?.data) return [];

    const carriers = response.dictionaries?.carriers ?? {};
    const locations = response.dictionaries?.locations ?? {};

    return response.data.map((offer: FlightOfferData) => {
        const firstItinerary = offer.itineraries[0];
        const firstSegments = firstItinerary?.segments ?? [];
        const firstSegment = firstSegments[0];
        const lastSegment = firstSegments[firstSegments.length - 1];

        const carrierCode =
            offer.validatingAirlineCodes?.[0] ??
            firstSegment?.carrierCode;

        const originCode = firstSegment?.departure.iataCode ?? "";
        const destCode = lastSegment?.arrival.iataCode ?? "";
        const originLoc = locations[originCode];
        const destLoc = locations[destCode];

        // Map all itineraries (outbound + return for round-trip)
        const itineraries: FlightItinerary[] = offer.itineraries.map((itin) => ({
            duration: itin.duration,
            segments: mapSegments(itin.segments),
        }));

        return {
            id: offer.id,
            priceTotal: offer.price?.total ?? "N/A",
            currency: offer.price?.currency ?? "INR",
            carrierCode,
            carrierName: carrierCode ? (carriers[carrierCode] ?? carrierCode) : undefined,
            origin: {
                iataCode: originCode,
                city: originLoc?.cityCode,
                country: originLoc?.countryCode,
            },
            destination: {
                iataCode: destCode,
                city: destLoc?.cityCode,
                country: destLoc?.countryCode,
            },
            duration: firstItinerary?.duration,
            segments: itineraries[0]?.segments ?? [],
            itineraries,
            rawOffer: offer as unknown as Record<string, unknown>,
        };
    });
}
