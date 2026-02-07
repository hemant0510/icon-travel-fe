export interface FlightSearchRequest {
    originDestinations: OriginDestination[];
    travelers: Traveler[];
    sources: string[];
    searchCriteria?: SearchCriteria;
}

export interface OriginDestination {
    id: string;
    originLocationCode: string;
    destinationLocationCode: string;
    departureDateTime: DateTimeRange;
}

export interface DateTimeRange {
    date: string;
    time?: string;
}

export interface Traveler {
    id: string;
    travelerType: string;
}

export interface SearchCriteria {
    maxFlightOffers?: number;
    flightFilters?: FlightFilters;
}

export interface FlightFilters {
    cabinRestrictions?: CabinRestriction[];
    carrierRestrictions?: CarrierRestrictions;
}

export interface CabinRestriction {
    cabin: string;
    coverage: string;
    originDestinationIds: string[];
}

export interface CarrierRestrictions {
    blacklistedInEUAllowed: boolean;
    excludedCarrierCodes?: string[];
    includedCarrierCodes?: string[];
}
