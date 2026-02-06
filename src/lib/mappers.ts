import { FlightAvailabilityResponse, FlightOffer, Segment } from '../models/responses/FlightSearchResponse';
import { UnifiedFlight, FlightSegment } from '../types/flight';

export function mapAmadeusToUnified(response: FlightAvailabilityResponse): UnifiedFlight[] {
    if (!response?.data) return [];

    return response.data.map((offer: FlightOffer) => {
        const segments = offer.segments;
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        const mappedSegments: FlightSegment[] = segments.map((seg: Segment) => ({
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
            duration: undefined, // API structure for segment duration wasn't in the example
            stops: seg.numberOfStops
        }));

        return {
            id: offer.id,
            priceTotal: "N/A", // Availability API doesn't return price
            currency: "N/A",
            carrierCode: firstSegment.carrierCode,
            carrierName: firstSegment.carrierCode, // Placeholder
            origin: {
                iataCode: firstSegment.departure.iataCode
            },
            destination: {
                iataCode: lastSegment.arrival.iataCode
            },
            duration: offer.duration,
            segments: mappedSegments
        };
    });
}
