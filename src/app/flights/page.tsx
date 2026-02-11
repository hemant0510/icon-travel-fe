import { cookies, headers } from "next/headers";
import FlightFilters from "@/components/FlightFilters";
import FlightSearchForm from "@/components/FlightSearchForm";
import type { FlightSearchState } from "@/app/actions/flightActions";
import type { FlightSearchParams, TripType } from "@/types/flight";
import { Plane } from "lucide-react";
import { getCurrencyFromServer, normalizeCurrencyCode } from "@/lib/currency";

type FlightsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const headersList = await headers();
  const serverCurrency = await getCurrencyFromServer(cookieStore, headersList);
  const queryCurrency = typeof query.currencyCode === "string" ? normalizeCurrencyCode(query.currencyCode) : undefined;
  const resolvedCurrency = queryCurrency ?? serverCurrency;

  const today = new Date();
  const defaultDeparture = new Date(today);
  defaultDeparture.setDate(today.getDate() + 7);

  const initialParams: FlightSearchParams = {
    origin: typeof query.origin === "string" ? query.origin.toUpperCase() : "",
    destination: typeof query.destination === "string" ? query.destination.toUpperCase() : "",
    departureDate: typeof query.departureDate === "string" ? query.departureDate : defaultDeparture.toISOString().slice(0, 10),
    returnDate: typeof query.returnDate === "string" ? query.returnDate : undefined,
    adults: typeof query.adults === "string" ? Math.max(1, Number(query.adults) || 1) : 1,
    max: 25,
    tripType: (query.tripType === "round-trip" ? "round-trip" : "one-way") as TripType,
    currencyCode: resolvedCurrency,
  };

  // Auto-search if origin and destination are provided from home page
  const hasSearchParams = initialParams.origin.length === 3 && initialParams.destination.length === 3;
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
            initialParams={initialParams}
            autoSearch={hasSearchParams}
          />
        </div>
      </div>
    </div>
  );
}
