import { Hotel as HotelIcon } from "lucide-react";
import HotelPageContent from "@/components/hotels/HotelPageContent";
import { mockHotels } from "@/data/mockHotels";

type HotelsPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const resolvedSearchParams = await searchParams;
  const cityCode =
    typeof resolvedSearchParams?.cityCode === "string" ? resolvedSearchParams.cityCode.toUpperCase() : "";
  const checkIn = typeof resolvedSearchParams?.checkIn === "string" ? resolvedSearchParams.checkIn : "";
  const checkOut = typeof resolvedSearchParams?.checkOut === "string" ? resolvedSearchParams.checkOut : "";
  const guestsRaw = typeof resolvedSearchParams?.guests === "string" ? Number(resolvedSearchParams.guests) : 2;
  const roomsRaw = typeof resolvedSearchParams?.rooms === "string" ? Number(resolvedSearchParams.rooms) : 1;
  const guests = Number.isFinite(guestsRaw) ? Math.max(1, Math.min(10, guestsRaw)) : 2;
  const rooms = Number.isFinite(roomsRaw) ? Math.max(1, Math.min(5, roomsRaw)) : 1;
  const hasSearchParams = cityCode.length === 3 && Boolean(checkIn) && Boolean(checkOut);
  return (
    <div>
      {/* Gradient header */}
      {/* Gradient header */}
      <div className="gradient-hero px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <HotelIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Search Hotels
              </h1>
              <p className="text-sm text-white/70">
                Find perfect stays at the best prices worldwide
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <HotelPageContent
          fallbackHotels={mockHotels}
          initialParams={{ cityCode, checkIn, checkOut, guests, rooms }}
          autoSearch={hasSearchParams}
        />
      </div>
    </div>
  );
}
