import amadeusClient from '@/lib/amadeus/httpClient';
import type { HotelListResponse, HotelOffersResponse } from '@/models/responses/HotelSearchResponse';

export type HotelSearchRawResult = {
  hotelList: HotelListResponse;
  hotelOffers: HotelOffersResponse;
};

class HotelService {
  private static instance: HotelService;

  private constructor() {}

  public static getInstance(): HotelService {
    if (!HotelService.instance) {
      HotelService.instance = new HotelService();
    }
    return HotelService.instance;
  }

  public async searchHotels(params: {
    cityCode: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    rooms: number;
    currency?: string;
  }): Promise<HotelSearchRawResult> {
    try {
      // 1. Get list of hotels in the city
      const hotelsData = await amadeusClient.get<HotelListResponse>(
        '/v1/reference-data/locations/hotels/by-city',
        { cityCode: params.cityCode }
      );

      if (!hotelsData.data || hotelsData.data.length === 0) {
        return { hotelList: hotelsData, hotelOffers: { data: [] } };
      }

      // 2. Get offers for found hotels
      const hotelIds = hotelsData.data.slice(0, 50).map(h => h.hotelId);

      const offersData = await amadeusClient.get<HotelOffersResponse>(
        '/v3/shopping/hotel-offers',
        {
          hotelIds: hotelIds.join(','),
          adults: params.adults,
          checkInDate: params.checkIn,
          checkOutDate: params.checkOut,
          roomQuantity: params.rooms,
          currency: params.currency,
        }
      );

      return { hotelList: hotelsData, hotelOffers: offersData };
    } catch (error) {
      console.error('HotelService:', error);
      throw error;
    }
  }
}

export default HotelService.getInstance();
