import type { HotelOfferData, HotelListItem } from '@/models/responses/HotelSearchResponse';
import type { Hotel } from '@/types/hotel';

export type HotelMetaMap = Map<string, { countryCode?: string; cityCode?: string; name?: string }>;

export function buildHotelMetaMap(hotelList: HotelListItem[]): HotelMetaMap {
    const meta: HotelMetaMap = new Map();
    hotelList.forEach((hotel) => {
        meta.set(hotel.hotelId, {
            countryCode: hotel.address?.countryCode,
            cityCode: hotel.iataCode,
            name: hotel.name,
        });
    });
    return meta;
}

export function mapHotelOffersResponse(
    offers: HotelOfferData[],
    hotelMeta: HotelMetaMap
): Hotel[] {
    return offers.map((offer) => {
        const meta = hotelMeta.get(offer.hotel.hotelId);
        const bestOffer = offer.offers?.[0];
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
            stars: 3,
            rating: 4.5,
            reviewCount: 100,
            pricePerNight,
            currency: bestOffer ? bestOffer.price.currency : 'USD',
            amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
            description: bestOffer?.room?.description?.text || "Comfortable stay with modern amenities.",
            image: undefined,
        };
    });
}
