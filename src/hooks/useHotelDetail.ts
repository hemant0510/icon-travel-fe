import { useState, useEffect } from "react";
import type { Hotel } from "@/types/hotel";

type UseHotelDetailReturn = {
  hotel: Hotel | null;
  loading: boolean;
  error: string | null;
};

export function useHotelDetail(
  hotelId: string,
  params: {
    checkIn: string;
    checkOut: string;
    adults: number;
    rooms: number;
    currency?: string;
  }
): UseHotelDetailReturn {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  // Start with loading true to avoid flash of "not found" content
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If required params are missing, stop loading and return
    if (!hotelId || !params.checkIn || !params.checkOut) {
        setLoading(false);
        return;
    }

    const fetchHotel = async () => {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams({
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        adults: params.adults.toString(),
        rooms: params.rooms.toString(),
        currency: params.currency || 'USD'
      });

      try {
        const res = await fetch(`/api/hotels/${hotelId}?${searchParams.toString()}`);
        const data = await res.json();

        if (!res.ok) {
           throw new Error(data?.error?.message || "Failed to fetch hotel details");
        }

        setHotel(data.hotel);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId, params.checkIn, params.checkOut, params.adults, params.rooms, params.currency]);

  return { hotel, loading, error };
}
