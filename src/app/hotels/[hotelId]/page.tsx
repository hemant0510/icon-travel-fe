import HotelDetailContent from "@/components/hotels/HotelDetailContent";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ hotelId: string }>;
}) {
  const { hotelId } = await params;
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    }>
      <HotelDetailContent hotelId={hotelId} />
    </Suspense>
  );
}
