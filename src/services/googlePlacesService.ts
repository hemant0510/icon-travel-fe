import type { GooglePlaceSearchResponse, GooglePlaceDetailsResponse, GooglePlaceDetails } from '@/models/responses/GooglePlacesResponse';

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

class GooglePlacesService {
  private static instance: GooglePlacesService;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private readonly placeIdCache = new Map<string, CacheEntry<string | null>>();
  private readonly detailsCache = new Map<string, CacheEntry<GooglePlaceDetails | null>>();
  private readonly successTtlMs = 1000 * 60 * 60 * 6;
  private readonly failureTtlMs = 1000 * 60 * 10;

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
      const ref = encodeURIComponent(photoReference);
      return `/api/places/photo?ref=${ref}&maxWidth=${maxWidth}`;
    } catch (error) {
      console.warn('GooglePlacesService: Failed to build photo URL', error);
      return '';
    }
  }

  private getCacheValue<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  private setCacheValue<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number) {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  public async findPlaceId(
    hotelName: string,
    city?: string,
    country?: string,
    latitude?: number,
    longitude?: number
  ): Promise<string | null> {
    try {
      const apiKey = this.getApiKey();
      const input = [hotelName, city, country].filter(Boolean).join(', ');
      const cacheKey = `placeId:${input}:${latitude ?? ''}:${longitude ?? ''}`;
      const cached = this.getCacheValue(this.placeIdCache, cacheKey);
      if (cached !== undefined) return cached;
      const url = new URL(`${this.baseUrl}/findplacefromtext/json`);
      url.searchParams.append('input', input);
      url.searchParams.append('inputtype', 'textquery');
      url.searchParams.append('fields', 'place_id,name,geometry');
      url.searchParams.append('key', apiKey);

      if (latitude && longitude) {
        url.searchParams.append('locationbias', `circle:2000@${latitude},${longitude}`);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
      }

      const data: GooglePlaceSearchResponse = await response.json();
      
      if (data.status === 'OK' && data.candidates.length > 0) {
        const placeId = data.candidates[0].place_id;
        this.setCacheValue(this.placeIdCache, cacheKey, placeId, this.successTtlMs);
        return placeId;
      }

      this.setCacheValue(this.placeIdCache, cacheKey, null, this.failureTtlMs);
      return null;
    } catch (error) {
      console.error('GooglePlacesService: Find Place error', error);
      return null; // Graceful fallback
    }
  }

  public async getPlaceDetails(placeId: string, fields: string[] = ['name', 'rating', 'user_ratings_total', 'photos', 'reviews', 'formatted_address', 'geometry', 'url', 'website', 'formatted_phone_number']): Promise<GooglePlaceDetails | null> {
    try {
      const apiKey = this.getApiKey();
      const cacheKey = `details:${placeId}:${fields.join(',')}`;
      const cached = this.getCacheValue(this.detailsCache, cacheKey);
      if (cached !== undefined) return cached;
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
        this.setCacheValue(this.detailsCache, cacheKey, data.result, this.successTtlMs);
        return data.result;
      }

      this.setCacheValue(this.detailsCache, cacheKey, null, this.failureTtlMs);
      return null;
    } catch (error) {
      console.error('GooglePlacesService: Place Details error', error);
      return null; // Graceful fallback
    }
  }
}

export default GooglePlacesService.getInstance();
