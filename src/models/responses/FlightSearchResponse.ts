// --- Flight Availability API (v1) types (kept for backward compat) ---

export interface FlightAvailabilityResponse {
    meta: {
        count: number;
    };
    data: FlightAvailabilityOffer[];
}

export interface FlightAvailabilityOffer {
    type: string;
    id: string;
    originDestinationId: string;
    source: string;
    instantTicketingRequired: boolean;
    paymentCardRequired: boolean;
    duration: string;
    segments: AvailabilitySegment[];
}

export interface AvailabilitySegment {
    departure: FlightEndpoint;
    arrival: FlightEndpoint;
    carrierCode: string;
    number: string;
    aircraft: { code: string };
    operating?: { carrierCode: string };
    id: string;
    numberOfStops: number;
    blacklistedInEU: boolean;
    availabilityClasses: AvailabilityClass[];
}

export interface AvailabilityClass {
    numberOfBookableSeats: number;
    class: string;
}

// --- Flight Offers Search API (v2) types ---

export interface FlightOffersResponse {
    meta?: { count: number };
    data: FlightOfferData[];
    dictionaries?: FlightDictionaries;
}

export interface FlightOfferData {
    type: string;
    id: string;
    source: string;
    instantTicketingRequired?: boolean;
    oneWay?: boolean;
    lastTicketingDate?: string;
    numberOfBookableSeats?: number;
    itineraries: Itinerary[];
    price: FlightPrice;
    pricingOptions?: {
        fareType?: string[];
        includedCheckedBagsOnly?: boolean;
    };
    validatingAirlineCodes?: string[];
    travelerPricings?: TravelerPricing[];
}

export interface Itinerary {
    duration?: string;
    segments: OfferSegment[];
}

export interface OfferSegment {
    departure: FlightEndpoint;
    arrival: FlightEndpoint;
    carrierCode: string;
    number: string;
    aircraft?: { code: string };
    operating?: { carrierCode: string };
    duration?: string;
    id: string;
    numberOfStops: number;
    blacklistedInEU?: boolean;
}

export interface FlightEndpoint {
    iataCode: string;
    terminal?: string;
    at: string;
}

export interface FlightPrice {
    currency: string;
    total: string;
    base?: string;
    grandTotal?: string;
    fees?: Array<{ amount: string; type: string }>;
}

export interface TravelerPricing {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
        currency: string;
        total: string;
        base?: string;
    };
    fareDetailsBySegment?: Array<{
        segmentId: string;
        cabin?: string;
        fareBasis?: string;
        brandedFare?: string;
        brandedFareLabel?: string;
        class?: string;
    }>;
}

export interface FlightDictionaries {
    locations?: Record<string, {
        cityCode?: string;
        countryCode?: string;
    }>;
    aircraft?: Record<string, string>;
    currencies?: Record<string, string>;
    carriers?: Record<string, string>;
}
