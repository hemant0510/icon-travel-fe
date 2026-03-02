import { useState, useEffect } from "react";
import type { Hotel } from "@/types/hotel";

type UseHotelDetailReturn = {
  hotel: Hotel | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

/**
 * Fetches hotel details with proper race condition handling.
 * 
 * FIXED ISSUES:
 * - Added AbortController to cancel stale requests when params change
 * - Proper dependency array (no object reference issues)
 * - Validates params before fetching
 * - Added retry mechanism
 */
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const retry = () => setRetryTrigger((prev) => prev + 1);

  useEffect(() => {
    // Validate params
    if (!hotelId || !params.checkIn || !params.checkOut) {
      setLoading(false);
      setError("Missing required search parameters");
      return;
    }

    if (params.adults < 1 || params.rooms < 1) {
      setLoading(false);
      setError("Invalid search parameters: adults and rooms must be at least 1");
      return;
    }

    const abortController = new AbortController();
    let isActive = true;

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
        const res = await fetch(`/api/hotels/${hotelId}?${searchParams.toString()}`, {
          signal: abortController.signal,
        });

        if (!isActive) return; // Component unmounted or params changed

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error?.message || "Failed to fetch hotel details");
        }

        setHotel(data.hotel);
      } catch (err) {
        if (!isActive) return;
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request cancelled, not an error
        }
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchHotel();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [hotelId, params.checkIn, params.checkOut, params.adults, params.rooms, params.currency, retryTrigger]);

  return { hotel, loading, error, retry };
}
