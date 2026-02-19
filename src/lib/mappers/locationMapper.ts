import type { LocationData, LocationSearchResponse } from '@/models/responses/LocationSearchResponse';

export type MappedLocation = {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
  countryName?: string;
  subType: string;
  score?: number;
};

export function mapLocationResponse(response: LocationSearchResponse): MappedLocation[] {
  if (!response?.data) return [];

  return response.data.map(mapLocationData);
}

export function mapLocationData(location: LocationData): MappedLocation {
  return {
    iataCode: location.iataCode,
    name: location.name,
    cityName: location.address.cityName ?? '',
    countryCode: location.address.countryCode,
    countryName: location.address.countryName,
    subType: location.subType,
    score: location.analytics?.travelers?.score,
  };
}
