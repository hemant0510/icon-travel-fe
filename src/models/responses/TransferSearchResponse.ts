export interface TransferOffersResponse {
  data: TransferOfferData[];
}

export interface TransferOfferData {
  type: string;
  id: string;
  transferType: string;
  start: TransferLocation;
  end: TransferLocation;
  vehicle: TransferVehicle;
  serviceProvider: TransferServiceProvider;
  quotation: TransferQuotation;
  converted?: TransferQuotation;
  cancellationRules?: TransferCancellationRule[];
  duration?: string;
  distance?: {
    value: number;
    unit: string;
  };
}

export interface TransferLocation {
  dateTime?: string;
  locationCode?: string;
  address?: {
    line?: string;
    zip?: string;
    countryCode?: string;
    cityName?: string;
    latitude?: number;
    longitude?: number;
  };
  name?: string;
}

export interface TransferVehicle {
  code: string;
  category: string;
  description: string;
  imageURL?: string;
  seats?: Array<{ count: number }>;
  baggages?: Array<{ count: number; size?: string }>;
}

export interface TransferServiceProvider {
  code: string;
  name: string;
  logoUrl?: string;
}

export interface TransferQuotation {
  monetaryAmount: string;
  currencyCode: string;
  isEstimated?: boolean;
  base?: { monetaryAmount: string };
  discount?: { monetaryAmount: string };
  fees?: Array<{
    indicator?: string;
    monetaryAmount?: string;
    currencyCode?: string;
    description?: string;
  }>;
  totalFees?: { monetaryAmount: string };
}

export interface TransferCancellationRule {
  ruleDescription?: string;
  feeType?: string;
  feeValue?: string;
  currencyCode?: string;
  metricType?: string;
  metricMin?: string;
  metricMax?: string;
}
