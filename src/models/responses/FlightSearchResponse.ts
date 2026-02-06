export interface FlightAvailabilityResponse {
    meta: {
        count: number;
    };
    data: FlightOffer[];
}

export interface FlightOffer {
    type: string;
    id: string;
    originDestinationId: string;
    source: string;
    instantTicketingRequired: boolean;
    paymentCardRequired: boolean;
    duration: string;
    segments: Segment[];
}

export interface Segment {
    departure: FlightEndpoint;
    arrival: FlightEndpoint;
    carrierCode: string;
    number: string;
    aircraft: {
        code: string;
    };
    operating?: {
        carrierCode: string;
    };
    id: string;
    numberOfStops: number;
    blacklistedInEU: boolean;
    availabilityClasses: AvailabilityClass[];
}

export interface FlightEndpoint {
    iataCode: string;
    terminal?: string;
    at: string;
}

export interface AvailabilityClass {
    numberOfBookableSeats: number;
    class: string;
}
