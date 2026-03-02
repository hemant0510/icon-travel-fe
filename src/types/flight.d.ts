export interface Airport {
  iataCode: string;
  name?: string;
  city?: string;
  country?: string;
}

export interface FlightSegment {
  departure: {
    iataCode: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  carrierCode?: string;
  number?: string;
  duration?: string;
  stops?: number;
}

export interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    duration?: string;
    segments: FlightSegment[];
  }>;
  validatingAirlineCodes?: string[];
}

export interface FlightItinerary {
  duration?: string;
  segments: FlightSegment[];
}

export interface UnifiedFlight {
  id: string;
  priceTotal: string;
  currency: string;
  carrierCode?: string;
  carrierName?: string;
  origin: Airport;
  destination: Airport;
  duration?: string;
  segments: FlightSegment[];
  itineraries: FlightItinerary[];
  /** Raw Amadeus offer data — needed for Flight Offers Price API call */
  rawOffer?: Record<string, unknown>;
}

export type TripType = "one-way" | "round-trip";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  max?: number;
  tripType?: TripType;
  currencyCode?: string;
}

export interface BookingRequest {
  flightOfferId: string;
  traveler: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  contact: {
    email: string;
    phone?: string;
  };
}

/** Enriched fare detail per traveler per segment — returned by the Pricing API */
export interface FareDetailBySegment {
  segmentId?: string;
  cabin?: string;
  fareBasis?: string;
  brandedFare?: string;
  class?: string;
  includedCheckedBags?: {
    quantity?: number;
    weight?: number;
    weightUnit?: string;
  };
}

export interface TravelerPricing {
  travelerId?: string;
  travelerType?: string;
  price?: {
    currency?: string;
    total?: string;
    base?: string;
    taxes?: Array<{ amount?: string; code?: string }>;
  };
  fareDetailsBySegment?: FareDetailBySegment[];
}

/** Full priced flight — returned by /v1/shopping/flight-offers/pricing */
export interface PricedFlightOffer {
  type?: string;
  id?: string;
  source?: string;
  nonHomogeneous?: boolean;
  lastTicketingDate?: string;
  numberOfBookableSeats?: number;
  itineraries: Array<{
    duration?: string;
    segments: FlightSegment[];
  }>;
  price?: {
    currency?: string;
    total?: string;
    base?: string;
    grandTotal?: string;
    taxes?: Array<{ amount?: string; code?: string; nature?: string; included?: boolean }>;
    fees?: Array<{ amount?: string; type?: string }>;
  };
  pricingOptions?: {
    fareType?: string[];
    includedCheckedBagsOnly?: boolean;
  };
  validatingAirlineCodes?: string[];
  travelerPricings?: TravelerPricing[];
}

/** Enriched detail returned by /api/flights/[flightId] — used on the detail page */
export interface FlightDetail {
  flight: UnifiedFlight;
  pricedOffer: PricedFlightOffer | null;
  searchParams: FlightSearchParams;
}
