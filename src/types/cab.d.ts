export type VehicleCode = 'SDN' | 'ELC' | 'CAR' | 'SUV' | 'VAN' | 'LMS' | 'BUS';
export type VehicleCategory = 'ST' | 'BU' | 'FC';
export type TransferType = 'PRIVATE' | 'SHARED';

export interface Vehicle {
  id: string;
  name: string;
  vehicleCode: VehicleCode;
  category: VehicleCategory;
  categoryLabel: string;
  seats: number;
  bags: number;
  imageUrl?: string;
  price: number;
  currency: string;
  provider: {
    name: string;
    logoUrl?: string;
  };
  transferType: TransferType;
  duration?: string;
  durationMinutes?: number;
  distance?: {
    value: number;
    unit: string;
  };
  cancellationRules?: CancellationRule[];
}

export interface CancellationRule {
  ruleDescription?: string;
  feeType?: string;
  feeValue?: string;
  currencyCode?: string;
}

export interface TransferSearchParams {
  startLocationCode: string;
  endAddressLine: string;
  endCityName: string;
  endZipCode: string;
  endCountryCode: string;
  endName: string;
  endGeoCode: string;
  transferType: TransferType;
  startDateTime: string;
  passengers: number;
}

export interface CabFilters {
  priceRange: [number, number];
  vehicleCodes: VehicleCode[];
  categories: VehicleCategory[];
}
