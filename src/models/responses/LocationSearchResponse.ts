export interface LocationSearchResponse {
    meta: {
        count: number;
        links: {
            self: string;
            next?: string;
            last?: string;
        };
    };
    data: LocationData[];
    included?: {
        airports: Record<string, AirportData>;
    };
}

export interface LocationData {
    type: string;
    subType: string;
    name: string;
    detailedName: string;
    id: string;
    self: {
        href: string;
        methods: string[];
    };
    timeZoneOffset?: string;
    iataCode: string;
    geoCode: {
        latitude: number;
        longitude: number;
    };
    address: {
        cityName?: string;
        cityCode?: string;
        countryName?: string;
        countryCode: string;
        stateCode?: string;
        regionCode?: string;
    };
    analytics?: {
        travelers: {
            score: number;
        };
    };
    relationships?: Relationship[];
}

export interface Relationship {
    id: string;
    type: string;
    href: string;
}

export interface AirportData {
    subType: string;
    name: string;
    iataCode: string;
    address: {
        countryCode: string;
        stateCode?: string;
    };
    geoCode: {
        latitude: number;
        longitude: number;
    };
}
