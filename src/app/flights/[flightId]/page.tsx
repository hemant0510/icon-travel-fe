import { Suspense } from "react";
import type { Metadata } from "next";
import FlightDetailContent from "@/components/flights/FlightDetailContent";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Flight Details | IconFly",
  description: "View full flight details, fare breakdown, and baggage information.",
};

type FlightDetailPageProps = {
  params: Promise<{ flightId: string }>;
};

/**
 * Flight Detail Page (Server Component shell).
 *
 * The full UnifiedFlight object is stored in sessionStorage by FlightCard
 * when the user clicks "View Details". We pass the flightId to
 * FlightDetailContent (client) which retrieves it from sessionStorage
 * and calls the pricing API.
 *
 * URL: /flights/[flightId]?origin=BOM&destination=DEL&...
 * (search params are preserved so the back-link restores the results)
 */
export default async function FlightDetailPage({ params }: FlightDetailPageProps) {
  const { flightId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="animate-spin text-primary-600" size={48} />
        </div>
      }
    >
      <FlightDetailContent flightId={flightId} />
    </Suspense>
  );
}
