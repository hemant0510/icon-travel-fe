import { Hotel as HotelIcon } from "lucide-react";
import HotelPageContent from "@/components/hotels/HotelPageContent";
import { mockHotels } from "@/data/mockHotels";

export default function HotelsPage() {
  return (
    <div>
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
        <HotelPageContent fallbackHotels={mockHotels} />
      </div>
    </div>
  );
}
