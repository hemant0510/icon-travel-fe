import type { GooglePlaceSearchResponse, GooglePlaceDetailsResponse, GooglePlaceDetails } from '@/models/responses/GooglePlacesResponse';

class GooglePlacesService {
  private static instance: GooglePlacesService;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';

  private constructor() {}

  public static getInstance(): GooglePlacesService {
    if (!GooglePlacesService.instance) {
      GooglePlacesService.instance = new GooglePlacesService();
    }
    return GooglePlacesService.instance;
  }

  private getApiKey(): string {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GOOGLE_PLACES_API_KEY environment variable');
    }
    return apiKey;
  }

  public getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    try {
      const apiKey = this.getApiKey();
      return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
    } catch (error) {
      console.warn('GooglePlacesService: Failed to build photo URL', error);
      return '';
    }
  }

  public async findPlaceId(hotelName: string, latitude?: number, longitude?: number): Promise<string | null> {
    try {
      const apiKey = this.getApiKey();
      const url = new URL(`${this.baseUrl}/findplacefromtext/json`);
      url.searchParams.append('input', hotelName);
      url.searchParams.append('inputtype', 'textquery');
      url.searchParams.append('fields', 'place_id,name,geometry');
      url.searchParams.append('key', apiKey);

      if (latitude && longitude) {
        // Bias results to within 2km of the coordinates
        url.searchParams.append('locationbias', `circle:2000@${latitude},${longitude}`);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
      }

      const data: GooglePlaceSearchResponse = await response.json();
      
      if (data.status === 'OK' && data.candidates.length > 0) {
        return data.candidates[0].place_id;
      }
      
      return null;
    } catch (error) {
      console.error('GooglePlacesService: Find Place error', error);
      return null; // Graceful fallback
    }
  }

  public async getPlaceDetails(placeId: string, fields: string[] = ['name', 'rating', 'user_ratings_total', 'photos', 'reviews', 'formatted_address', 'geometry', 'url', 'website', 'formatted_phone_number']): Promise<GooglePlaceDetails | null> {
    try {
      const apiKey = this.getApiKey();
      const url = new URL(`${this.baseUrl}/details/json`);
      url.searchParams.append('place_id', placeId);
      url.searchParams.append('fields', fields.join(','));
      url.searchParams.append('key', apiKey);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
      }

      const data: GooglePlaceDetailsResponse = await response.json();

      if (data.status === 'OK') {
        return data.result;
      }

      return null;
    } catch (error) {
      console.error('GooglePlacesService: Place Details error', error);
      return null; // Graceful fallback
    }
  }
}

export default GooglePlacesService.getInstance();
