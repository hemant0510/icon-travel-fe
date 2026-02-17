import AuthService from '@/services/authService';
import type { HotelListResponse, HotelOffersResponse, HotelOfferData } from '@/models/responses/HotelSearchResponse';
import type { Hotel } from '@/types/hotel';

class HotelService {
  private static instance: HotelService;

  private constructor() { }

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
  }): Promise<Hotel[]> {
    try {
      const token = await AuthService.getToken();
      const baseUrl = process.env.AMADEUS_BASE_URL;

      if (!baseUrl) {
        throw new Error('Missing Amadeus API base URL');
      }

      const apiBase = baseUrl.replace(/\/v1\/?$/, '');

      // 1. Get list of hotels in the city
      const hotelsUrl = new URL(`${apiBase}/v1/reference-data/locations/hotels/by-city`);
      hotelsUrl.searchParams.append('cityCode', params.cityCode);

      const hotelsResponse = await fetch(hotelsUrl.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!hotelsResponse.ok) {
        // If 404 or empty, return empty array
        if (hotelsResponse.status === 404) return [];
        const errorText = await hotelsResponse.text();
        console.error(`Hotel list search failed: ${hotelsResponse.status} ${errorText}`);
        return [];
      }

      const hotelsData: HotelListResponse = await hotelsResponse.json();
      
      if (!hotelsData.data || hotelsData.data.length === 0) {
        return [];
      }

      const hotelMeta = new Map<string, { countryCode?: string; cityCode?: string; name?: string }>();
      hotelsData.data.forEach((hotel) => {
        hotelMeta.set(hotel.hotelId, {
          countryCode: hotel.address?.countryCode,
          cityCode: hotel.iataCode,
          name: hotel.name
        });
      });

      const hotelIds = hotelsData.data.slice(0, 50).map(h => h.hotelId);
      
      const offersUrl = new URL(`${apiBase}/v3/shopping/hotel-offers`);
      offersUrl.searchParams.append('hotelIds', hotelIds.join(','));
      offersUrl.searchParams.append('adults', params.adults.toString());
      offersUrl.searchParams.append('checkInDate', params.checkIn);
      offersUrl.searchParams.append('checkOutDate', params.checkOut);
      offersUrl.searchParams.append('roomQuantity', params.rooms.toString());
      if (params.currency) {
        offersUrl.searchParams.append('currency', params.currency);
      }

      const offersResponse = await fetch(offersUrl.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!offersResponse.ok) {
        if (offersResponse.status === 404) return [];
        const errorText = await offersResponse.text();
        console.error(`Hotel offers search failed: ${offersResponse.status} ${errorText}`);
        return [];
      }

      const offersData: HotelOffersResponse = await offersResponse.json();
      
      return this.mapToUnifiedHotels(offersData.data, hotelMeta);

    } catch (error) {
      console.error('Error searching hotels:', error);
      throw error;
    }
  }

  private mapToUnifiedHotels(
    offers: HotelOfferData[],
    hotelMeta: Map<string, { countryCode?: string; cityCode?: string; name?: string }>
  ): Hotel[] {
    return offers.map(offer => {
      const meta = hotelMeta.get(offer.hotel.hotelId);
      const bestOffer = offer.offers?.[0]; // Take the first offer (usually cheapest)
      const checkInDate = bestOffer?.checkInDate;
      const checkOutDate = bestOffer?.checkOutDate;
      const totalPrice = bestOffer ? parseFloat(bestOffer.price.total) : 0;
      const nights =
        checkInDate && checkOutDate
          ? Math.max(
              1,
              Math.ceil(
                (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 1;
      const pricePerNight = nights > 0 ? totalPrice / nights : totalPrice;

      return {
        id: offer.hotel.hotelId,
        name: meta?.name || offer.hotel.name,
        city: meta?.cityCode || offer.hotel.cityCode,
        country: meta?.countryCode || "Unknown", 
        stars: 3, // Default to 3 as API often misses this
        rating: 4.5, // Default good rating
        reviewCount: 100, // Default count
        pricePerNight,
        currency: bestOffer ? bestOffer.price.currency : 'USD',
        amenities: ["WiFi", "Pool", "Gym", "Restaurant"], // Mock amenities for UI
        description: bestOffer?.room?.description?.text || "Comfortable stay with modern amenities.",
        image: undefined 
      };
    });
  }
}

export default HotelService.getInstance();
