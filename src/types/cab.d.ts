export interface Vehicle {
  id: string;
  name: string;
  type: "sedan" | "suv" | "hatchback" | "luxury" | "van" | "auto";
  capacity: number;
  luggage: number;
  pricePerKm: number;
  basePrice: number;
  currency: string;
  features: string[];
  image?: string;
}

export interface CabSearchParams {
  tripType: "one-way" | "round-trip" | "hourly";
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
}
