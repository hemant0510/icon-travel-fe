import AuthService from '@/services/authService';
import type { FlightOffersResponse } from '../models/responses/FlightSearchResponse';

class FlightService {
  private static instance: FlightService;

  private constructor() { }

  public static getInstance(): FlightService {
    if (!FlightService.instance) {
      FlightService.instance = new FlightService();
    }
    return FlightService.instance;
  }

  public async searchFlights(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    max?: number;
    currencyCode?: string;
  }): Promise<FlightOffersResponse> {
    try {
      const token = await AuthService.getToken();
      const baseUrl = process.env.VITE_AMADEUS_BASE_URL;

      if (!baseUrl) {
        throw new Error('Missing Amadeus API base URL');
      }

      // Use v2 Flight Offers Search GET API (returns pricing)
      // Base URL is https://test.api.amadeus.com/v1 — strip /v1 and use /v2
      const apiBase = baseUrl.replace(/\/v1\/?$/, '');
      const url = new URL(`${apiBase}/v2/shopping/flight-offers`);
      url.searchParams.append('originLocationCode', params.origin);
      url.searchParams.append('destinationLocationCode', params.destination);
      url.searchParams.append('departureDate', params.departureDate);
      if (params.returnDate) {
        url.searchParams.append('returnDate', params.returnDate);
      }
      url.searchParams.append('adults', String(params.adults));
      if (params.max) {
        url.searchParams.append('max', String(params.max));
      }
      if (params.currencyCode) {
        url.searchParams.append('currencyCode', params.currencyCode);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Flight search failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: FlightOffersResponse = await response.json();
      return data;

    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  }
}

export default FlightService.getInstance();
