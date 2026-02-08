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
