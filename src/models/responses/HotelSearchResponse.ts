export interface HotelListResponse {
  data: HotelListItem[];
  meta: {
    count: number;
    links: {
      self: string;
      next?: string;
    };
  };
}

export interface HotelListItem {
  chainCode: string;
  iataCode: string;
  dupeId: number;
  name: string;
  hotelId: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    countryCode: string;
  };
}

export interface HotelOffersResponse {
  data: HotelOfferData[];
}

export interface HotelOfferData {
  type: string;
  hotel: {
    type: string;
    hotelId: string;
    chainCode: string;
    dupeId: string;
    name: string;
    cityCode: string;
    latitude?: number;
    longitude?: number;
  };
  available: boolean;
  offers: HotelOffer[];
}

export interface HotelOffer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  rateCode: string;
  rateFamilyEstimated?: {
    code: string;
    type: string;
  };
  room: {
    type: string;
    typeEstimated?: {
      category?: string;
      beds?: number;
      bedType?: string;
    };
    description?: {
      text: string;
      lang: string;
    };
  };
  guests: {
    adults: number;
  };
  price: {
    currency: string;
    total: string;
    base?: string;
    taxes?: {
      code: string;
      amount: string;
      currency: string;
      included: boolean;
    }[];
    variations?: {
      average?: {
        base: string;
      };
      changes?: {
        startDate: string;
        endDate: string;
        base: string;
      }[];
    };
  };
}
