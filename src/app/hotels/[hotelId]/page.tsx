import HotelDetailContent from "@/components/hotels/HotelDetailContent";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ hotelId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { hotelId } = await params;
  const search = await searchParams;
  
  const checkIn = (search.checkIn as string) || "";
  const checkOut = (search.checkOut as string) || "";
  const adults = Number(search.guests) || 1;
  const rooms = Number(search.rooms) || 1;
  const currency = (search.currency as string) || "INR";

  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    }>
      <HotelDetailContent 
        hotelId={hotelId}
        checkIn={checkIn}
        checkOut={checkOut}
        adults={adults}
        rooms={rooms}
        currency={currency}
      />
    </Suspense>
  );
}
