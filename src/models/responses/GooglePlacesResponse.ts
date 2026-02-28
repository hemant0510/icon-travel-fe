export interface GooglePlaceSearchResponse {
  candidates: Array<{
    place_id: string;
    name: string;
    formatted_address?: string;
    geometry?: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
}

export interface GooglePlaceDetailsResponse {
  result: GooglePlaceDetails;
  status: string;
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }>;
  rating?: number;
  user_ratings_total?: number;
  reviews?: Array<{
    author_name: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
    profile_photo_url?: string;
  }>;
  formatted_phone_number?: string;
  website?: string;
  url?: string; // Google Maps URL
}
