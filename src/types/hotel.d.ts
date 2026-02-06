export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  stars: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  image?: string;
  description: string;
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface HotelFilters {
  priceRange: [number, number];
  stars: number[];
  amenities: string[];
}
