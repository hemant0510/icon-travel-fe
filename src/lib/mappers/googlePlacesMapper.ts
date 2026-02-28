import type { GooglePlaceDetails } from '@/models/responses/GooglePlacesResponse';
import type { HotelReview } from '@/types/hotel';
import GooglePlacesService from '@/services/googlePlacesService';

export function mapGooglePlaceDetailsToHotel(
  details: GooglePlaceDetails
): {
  latitude?: number;
  longitude?: number;
  rating: number;
  reviewCount: number;
  thumbnailImages: string[];
  images: string[];
  shortAddress: string;
  fullAddress: string;
  reviews: HotelReview[];
  website?: string;
  phoneNumber?: string;
} {
  const { geometry, rating, user_ratings_total, photos, formatted_address, reviews, website, formatted_phone_number } = details;

  // Build image URLs
  const allImages = (photos || []).map((photo) =>
    GooglePlacesService.getPhotoUrl(photo.photo_reference)
  );

  const thumbnailImages = allImages.slice(0, 3);

  // Map reviews
  const mappedReviews: HotelReview[] = (reviews || []).slice(0, 5).map((review) => ({
    authorName: review.author_name,
    rating: review.rating,
    text: review.text,
    relativeTime: review.relative_time_description,
    profilePhotoUrl: review.profile_photo_url,
  }));

  // Extract short address (e.g., "Paris, France" or just the first part)
  const shortAddress = formatted_address ? formatted_address.split(',')[0] : '';

  return {
    latitude: geometry?.location?.lat,
    longitude: geometry?.location?.lng,
    rating: rating || 0,
    reviewCount: user_ratings_total || 0,
    thumbnailImages,
    images: allImages,
    shortAddress,
    fullAddress: formatted_address || '',
    reviews: mappedReviews,
    website,
    phoneNumber: formatted_phone_number,
  };
}
