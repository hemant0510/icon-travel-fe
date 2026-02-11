import { cookies, headers } from "next/headers";
import { Hotel as HotelIcon } from "lucide-react";
import HotelSearchForm from "@/components/hotels/HotelSearchForm";
import HotelResults from "@/components/hotels/HotelResults";
import HotelFilters from "@/components/hotels/HotelFilters";
import { mockHotels } from "@/data/mockHotels";
import { getCurrencyFromServer } from "@/lib/currency";
import { fetchCurrencyRates } from "@/services/currencyService";

export default async function HotelsPage() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const currency = await getCurrencyFromServer(cookieStore, headersList);
  const rates = await fetchCurrencyRates(currency);

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
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside>
            <div className="lg:sticky lg:top-20">
              <HotelFilters />
            </div>
          </aside>
          <div className="flex flex-col gap-6">
            <HotelSearchForm />
            <HotelResults hotels={mockHotels} initialCurrency={currency} rates={rates} />
          </div>
        </div>
      </div>
    </div>
  );
}

