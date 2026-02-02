import FlightFilters from "@/components/FlightFilters";
import FlightSearchForm from "@/components/FlightSearchForm";
import type { FlightSearchState } from "@/app/actions/flightActions";
import type { FlightSearchParams } from "@/types/flight";

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

export default async function Home() {
  const searchParams = defaultSearchParams();
  const initialState: FlightSearchState = { status: "idle", flights: [] };

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
             Icon Travel Booking Platform
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 sm:text-base">
            Choose a route, submit the search, and see fresh results once the API responds.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <FlightFilters />
          <FlightSearchForm initialState={initialState} initialParams={searchParams} />
        </div>
      </main>
    </div>
  );
}
