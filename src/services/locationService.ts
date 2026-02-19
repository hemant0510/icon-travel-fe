import amadeusClient from '@/lib/amadeus/httpClient';
import type { LocationSearchResponse } from '@/models/responses/LocationSearchResponse';

class LocationService {
    private static instance: LocationService;

    private constructor() {}

    public static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    public async searchCity(keyword: string, subType: 'AIRPORT' | 'CITY' = 'AIRPORT'): Promise<LocationSearchResponse> {
        try {
            return await amadeusClient.get<LocationSearchResponse>(
                '/v1/reference-data/locations',
                { subType, keyword }
            );
        } catch (error) {
            console.error('LocationService:', error);
            throw error;
        }
    }
}

export default LocationService.getInstance();
