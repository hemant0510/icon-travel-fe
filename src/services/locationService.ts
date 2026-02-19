import AuthService from '@/services/authService';
import { LocationSearchResponse } from '../models/responses/LocationSearchResponse';

class LocationService {
    private static instance: LocationService;

    private constructor() { }

    public static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    public async searchCity(keyword: string, subType: 'AIRPORT' | 'CITY' = 'AIRPORT'): Promise<LocationSearchResponse> {
        try {
            const token = await AuthService.getToken();
            const baseUrl = process.env.AMADEUS_BASE_URL;

            if (!baseUrl) {
                throw new Error('Missing Amadeus API base URL');
            }

            const apiBase = baseUrl.replace(/\/v1\/?$/, '');

            // Construct URL with query parameters
            const url = new URL(`${apiBase}/v1/reference-data/locations`);
            url.searchParams.append('subType', subType);
            url.searchParams.append('keyword', keyword);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Location search failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data: LocationSearchResponse = await response.json();
            return data;

        } catch (error) {
            console.error('Error searching locations:', error);
            throw error;
        }
    }
}

export default LocationService.getInstance();
