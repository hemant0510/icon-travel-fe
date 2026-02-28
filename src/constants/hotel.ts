export const HOTEL_AMENITIES = [
  "WiFi",
  "Pool",
  "Spa",
  "Gym",
  "Restaurant",
  "Bar",
  "Parking",
  "Beach Access",
  "Air Conditioning",
  "24/7 Front Desk",
  "Housekeeping"
] as const;

export type HotelAmenity = typeof HOTEL_AMENITIES[number];
