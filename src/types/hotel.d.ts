export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  
  // Ratings & Category
  stars: number; // 1-5 stars (Hotel Category)
  rating: number; // 0-5 user rating (e.g. from Google)
  reviewCount: number;
  reviews?: HotelReview[];

  // Pricing
  pricePerNight: number;
  currency: string;
  
  // Content
  amenities: string[];
  image?: string; // Main thumbnail
  images?: string[]; // Gallery
  thumbnailImages?: string[];
  
  // Location
  latitude?: number;
  longitude?: number;
  shortAddress?: string;
  fullAddress?: string;
  
  // Details
  roomTypes?: string[];
  cancellationPolicy?: string;
  bookingLink?: string;
}

export interface HotelReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhotoUrl?: string;
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  currency?: string;
}

export interface HotelFilters {
  priceRange: [number, number];
  stars: number[];
  amenities: string[];
}
