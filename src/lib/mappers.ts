import type { FlightOffersResponse, FlightOfferData, OfferSegment } from '../models/responses/FlightSearchResponse';
import type { UnifiedFlight, FlightSegment } from '../types/flight';

export function mapOffersToUnified(response: FlightOffersResponse): UnifiedFlight[] {
    if (!response?.data) return [];

    const carriers = response.dictionaries?.carriers ?? {};
    const locations = response.dictionaries?.locations ?? {};

    return response.data.map((offer: FlightOfferData) => {
        const firstItinerary = offer.itineraries[0];
        const segments = firstItinerary?.segments ?? [];
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        const carrierCode =
            offer.validatingAirlineCodes?.[0] ??
            firstSegment?.carrierCode;

        const originCode = firstSegment?.departure.iataCode ?? "";
        const destCode = lastSegment?.arrival.iataCode ?? "";
        const originLoc = locations[originCode];
        const destLoc = locations[destCode];

        const mappedSegments: FlightSegment[] = segments.map((seg: OfferSegment) => ({
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
            segments: mappedSegments
        };
    });
}
