import FlightFilters from "@/components/FlightFilters";
import FlightSearchForm from "@/components/FlightSearchForm";
import type { FlightSearchState } from "@/app/actions/flightActions";
import type { FlightSearchParams } from "@/types/flight";
import { Plane } from "lucide-react";

const defaultSearchParams = (): FlightSearchParams => {
  const today = new Date();
  const departure = new Date(today);
  departure.setDate(today.getDate() + 7);

  return {
    origin: "DEL",
    destination: "BOM",
    departureDate: departure.toISOString().slice(0, 10),
    adults: 1,
    max: 12,
  };
};

export default function FlightsPage() {
  const searchParams = defaultSearchParams();
  const initialState: FlightSearchState = { status: "idle", flights: [] };

  return (
    <div>
      {/* Gradient header */}
      <div className="gradient-hero px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Plane className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Search Flights
              </h1>
              <p className="text-sm text-white/70">
                Find the best deals on domestic and international flights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <FlightFilters />
            </div>
          </aside>
          <FlightSearchForm
            initialState={initialState}
            initialParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
