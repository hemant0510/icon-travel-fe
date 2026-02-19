import amadeusClient from '@/lib/amadeus/httpClient';
import type { FlightOffersResponse } from '@/models/responses/FlightSearchResponse';

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
      return await amadeusClient.get<FlightOffersResponse>(
        '/v2/shopping/flight-offers',
        {
          originLocationCode: params.origin,
          destinationLocationCode: params.destination,
          departureDate: params.departureDate,
          returnDate: params.returnDate,
          adults: params.adults,
          max: params.max,
          currencyCode: params.currencyCode,
        }
      );
    } catch (error) {
      console.error('FlightService:', error);
      throw error;
    }
  }

  public async getFlightPrice(flightOffer: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      return await amadeusClient.post<Record<string, unknown>>(
        '/v1/shopping/flight-offers/pricing',
        {
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [flightOffer],
          },
        },
        { 'X-HTTP-Method-Override': 'GET' }
      );
    } catch (error) {
      console.error('FlightService:', error);
      throw error;
    }
  }
}

export default FlightService.getInstance();
