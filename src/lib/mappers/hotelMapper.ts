import type { HotelOfferData, HotelListItem } from '@/models/responses/HotelSearchResponse';
import type { Hotel } from '@/types/hotel';

export type HotelMetaMap = Map<string, { countryCode?: string; cityCode?: string; name?: string; latitude?: number; longitude?: number }>;

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560200353-ce0a76b1d438?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?auto=format&fit=crop&w=800&q=80",
];

const DEFAULT_AMENITIES = ["WiFi", "Air Conditioning", "24/7 Front Desk", "Housekeeping"];

function getFallbackImage(id: string): string {
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[index];
}

export function buildHotelMetaMap(hotelList: HotelListItem[]): HotelMetaMap {
    const meta: HotelMetaMap = new Map();
    hotelList.forEach((hotel) => {
        meta.set(hotel.hotelId, {
            countryCode: hotel.address?.countryCode,
            cityCode: hotel.iataCode,
            name: hotel.name,
            latitude: hotel.geoCode?.latitude,
            longitude: hotel.geoCode?.longitude,
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

        const policies = bestOffer?.policies;
        const cancellationPolicy = policies?.cancellations?.[0]?.description?.text || policies?.guarantee?.description?.text;

        const roomTypes = Array.from(new Set(offer.offers.map(o => o.room.typeEstimated?.category || o.room.description?.text).filter(Boolean))) as string[];
        
        // Amadeus returns rating as string (1-5 stars)
        // Default to 3 stars if missing so it shows up in filters
        let stars = offer.hotel.rating ? parseInt(offer.hotel.rating) : 0;
        if (stars === 0) stars = 3;

        const amenities = DEFAULT_AMENITIES; // Amadeus offers endpoint doesn't return amenities, so we provide reasonable defaults

        return {
            id: offer.hotel.hotelId,
            name: meta?.name || offer.hotel.name,
            city: meta?.cityCode || offer.hotel.cityCode,
            country: meta?.countryCode || "Unknown",
            stars,
            rating: 0, // Will be overwritten by Google data if available
            reviewCount: 0, // Will be overwritten by Google data if available
            pricePerNight,
            currency: bestOffer ? bestOffer.price.currency : 'USD',
            amenities,
            description: bestOffer?.room?.description?.text || "Comfortable stay with modern amenities.",
            image: getFallbackImage(offer.hotel.hotelId), // Set a fallback image initially
            latitude: meta?.latitude || offer.hotel.latitude,
            longitude: meta?.longitude || offer.hotel.longitude,
            cancellationPolicy,
            roomTypes,
        };
    });
}
