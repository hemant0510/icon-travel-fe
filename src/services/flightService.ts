import AuthService from '@/services/authService';
import { FlightSearchRequest } from '../models/requests/FlightSearchRequest';
import { FlightAvailabilityResponse } from '../models/responses/FlightSearchResponse';

class FlightService {
  private static instance: FlightService;

  private constructor() { }

  public static getInstance(): FlightService {
    if (!FlightService.instance) {
      FlightService.instance = new FlightService();
    }
    return FlightService.instance;
  }

  public async searchFlights(request: FlightSearchRequest): Promise<FlightAvailabilityResponse> {
    try {
      const token = await AuthService.getToken();
      const baseUrl = process.env.VITE_AMADEUS_BASE_URL;

      if (!baseUrl) {
        throw new Error('Missing Amadeus API base URL');
      }

      const url = `${baseUrl}/shopping/availability/flight-availabilities`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HTTP-Method-Override': 'GET',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Flight search failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: FlightAvailabilityResponse = await response.json();
      return data;

    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  }
}

export default FlightService.getInstance();
