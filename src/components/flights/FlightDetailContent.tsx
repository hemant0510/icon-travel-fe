"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { UnifiedFlight, FlightSegment } from "@/types/flight";
import { useFlightDetail } from "@/hooks/useFlightDetail";
import { ChevronLeft, Loader2, Clock, Plane, AlertCircle } from "lucide-react";
import Link from "next/link";

/* ── Helpers ──────────────────────────────────────────────── */

/** "PT2H15M" → "2h 15m", "PT13H" → "13h 0m" */
function formatDuration(iso?: string): string {
  if (!iso) return "--";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ?? "0";
  const m = match[2] ?? "0";
  return `${h}h ${m}m`;
}

/** ISO datetime → "06:30" */
function formatTime(iso?: string): string {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** ISO datetime → "Mon, 10 Feb" */
function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

/** ISO datetime → "10 Feb 2024" */
function formatFullDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Total stops across all segments in an itinerary */
function totalStops(segments: FlightSegment[]): number {
  const segStops = segments.reduce((sum, s) => sum + (s.stops ?? 0), 0);
  const connections = Math.max(0, segments.length - 1);
  return segStops + connections;
}

/** Layover between two consecutive segments */
function layoverDuration(prev: FlightSegment, next: FlightSegment): string {
  const arrMs = new Date(prev.arrival.at).getTime();
  const depMs = new Date(next.departure.at).getTime();
  const diff = depMs - arrMs;
  if (diff <= 0) return "--";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

/** Format price with currency */
function formatPrice(amount?: string, currency?: string): string {
  if (!amount) return "--";
  if (Number.isNaN(Number(amount))) {
    return `${currency ?? "INR"} ${amount}`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency ?? "INR",
  }).format(Number(amount));
}

/* ── Segment Timeline ──────────────────────────────────────── */

function SegmentTimeline({ segments }: { segments: FlightSegment[] }) {
  return (
    <div className="flex flex-col gap-3">
      {segments.map((seg, idx) => (
        <div key={idx}>
          {/* Layover banner */}
          {idx > 0 && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
              <Clock size={12} />
              <span>
                Layover at <strong>{seg.departure.iataCode}</strong> &mdash; {layoverDuration(segments[idx - 1], seg)}
              </span>
            </div>
          )}

          <div className="flex items-stretch gap-3">
            {/* Timeline dot + spine */}
            <div className="flex flex-col items-center self-stretch">
              <span className="mt-[6px] h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500" />
              <div className="w-px flex-1 bg-primary-200" />
              <span className="mb-[6px] h-2.5 w-2.5 shrink-0 rounded-full border-2 border-primary-500 bg-white" />
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">{formatTime(seg.departure.at)}</span>
                <span className="text-text-secondary">{seg.departure.iataCode}</span>
                <span className="text-text-muted">{formatDate(seg.departure.at)}</span>
              </div>

              <div className="ml-1 flex items-center gap-2 text-text-muted">
                <Plane size={11} />
                <span>
                  {seg.carrierCode ?? ""}{seg.number ? `-${seg.number}` : ""}
                </span>
                <span>&middot;</span>
                <span>{formatDuration(seg.duration)}</span>
                {(seg.stops ?? 0) > 0 && (
                  <>
                    <span>&middot;</span>
                    <span>{seg.stops} technical stop(s)</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">{formatTime(seg.arrival.at)}</span>
                <span className="text-text-secondary">{seg.arrival.iataCode}</span>
                <span className="text-text-muted">{formatDate(seg.arrival.at)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */

type FlightDetailContentProps = {
  flightId: string;
};

export default function FlightDetailContent({ flightId }: FlightDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flight, setFlight] = useState<UnifiedFlight | null>(null);
  const [hydrationError, setHydrationError] = useState<string | null>(null);

  const { pricedOffer, loading, error } = useFlightDetail(flight);

  // Hydrate flight from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`flight_detail_${flightId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFlight(parsed);
      } else {
        setHydrationError("Flight data not found. Please go back and select a flight.");
      }
    } catch (err) {
      setHydrationError("Failed to load flight data.");
      console.error("Hydration error:", err);
    }
  }, [flightId]);

  if (hydrationError) {
    return (
      <div className="min-h-screen bg-background-light pb-20 pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary-600"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-text-primary">{hydrationError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-background-light pb-20 pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary-600" size={48} />
        </div>
      </div>
    );
  }

  const isRoundTrip = flight.itineraries.length > 1;
  const firstItinerary = flight.itineraries[0];
  const secondItinerary = flight.itineraries[1];

  const firstSegments = firstItinerary?.segments ?? [];
  const secondSegments = secondItinerary?.segments ?? [];

  const firstStops = totalStops(firstSegments);
  const secondStops = isRoundTrip ? totalStops(secondSegments) : 0;

  const firstDep = firstSegments[0];
  const firstArr = firstSegments[firstSegments.length - 1];
  const secondDep = secondSegments[0];
  const secondArr = secondSegments[secondSegments.length - 1];

  // Format price
  const formattedPrice = formatPrice(flight.priceTotal, flight.currency);

  // Extract fare breakdown from pricedOffer
  const priceInfo = pricedOffer?.price;
  const baseFare = priceInfo?.base;
  const taxesAmount = priceInfo?.total && priceInfo?.base 
    ? (Number(priceInfo.total) - Number(priceInfo.base)).toFixed(2)
    : undefined;
  const totalPrice = priceInfo?.grandTotal ?? priceInfo?.total;

  // Extract baggage info
  const travelerInfo = pricedOffer?.travelerPricings?.[0];
  const fareDetail = travelerInfo?.fareDetailsBySegment?.[0];
  const cabin = fareDetail?.cabin;
  const baggage = fareDetail?.includedCheckedBags;

  return (
    <div className="min-h-screen bg-background-light pb-20 pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary-600"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Main grid: 2 cols on lg, 1 col on smaller */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column: main content (lg:col-span-2) */}
          <div className="lg:col-span-2">
            {/* Header block */}
            <div className="mb-6">
              <h1 className="mb-2 text-3xl font-bold text-text-primary">
                {flight.origin.iataCode} → {flight.destination.iataCode}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span>{formatFullDate(firstDep?.departure.at)}</span>
                {isRoundTrip && <span>•</span>}
                {isRoundTrip && <span>{formatFullDate(secondDep?.departure.at)}</span>}
                <span>•</span>
                <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 font-medium text-primary-600">
                  {flight.carrierName ?? flight.carrierCode ?? "Airline"}
                </span>
              </div>
            </div>

            {/* Round-trip tabs if applicable */}
            {isRoundTrip && (
              <div className="mb-6 flex gap-1 rounded-xl bg-surface-dim p-1">
                <button className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-text-primary shadow-sm">
                  Outbound
                </button>
                <button className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-white/50">
                  Return
                </button>
              </div>
            )}

            {/* Hero section: Segment timeline */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      {isRoundTrip ? "Outbound" : "Flight"}
                    </p>
                    <p className="text-sm text-text-secondary">{formatDuration(firstItinerary?.duration)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    firstStops === 0 
                      ? "bg-green-100 text-green-700"
                      : firstStops === 1
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {firstStops === 0 ? "Non Stop" : firstStops === 1 ? "1 Stop" : `${firstStops} Stops`}
                  </span>
                </div>
              </div>
              <SegmentTimeline segments={firstSegments} />

              {isRoundTrip && secondItinerary && (
                <>
                  <div className="my-6 border-t border-dashed border-border" />
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Return</p>
                        <p className="text-sm text-text-secondary">{formatDuration(secondItinerary.duration)}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        secondStops === 0 
                          ? "bg-green-100 text-green-700"
                          : secondStops === 1
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {secondStops === 0 ? "Non Stop" : secondStops === 1 ? "1 Stop" : `${secondStops} Stops`}
                      </span>
                    </div>
                  </div>
                  <SegmentTimeline segments={secondSegments} />
                </>
              )}
            </div>

            {/* Fare breakdown */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-text-primary">Fare Breakdown</h2>
              
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Loader2 size={14} className="animate-spin" />
                  Loading fare details...
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={14} />
                  {error}
                </div>
              ) : priceInfo ? (
                <div className="space-y-3">
                  {baseFare && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Base Fare</span>
                      <span className="font-medium text-text-primary">
                        {flight.currency} {baseFare}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Taxes & Fees</span>
                    <span className="font-medium text-text-primary">
                      {flight.currency} {taxesAmount ?? "--"}
                    </span>
                  </div>
                  <div className="border-t border-border-light pt-3 flex justify-between">
                    <span className="font-semibold text-text-primary">Total</span>
                    <span className="text-lg font-bold text-primary-700">
                      {flight.currency} {totalPrice}
                    </span>
                  </div>

                  {/* Cabin & baggage chips */}
                  {(cabin || baggage) && (
                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-border-light">
                      {cabin && (
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600">
                          {cabin}
                        </span>
                      )}
                      {baggage?.quantity != null && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          {baggage.quantity} checked bag{baggage.quantity !== 1 ? "s" : ""}
                        </span>
                      )}
                      {baggage?.weight != null && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          {baggage.weight} {baggage.weightUnit ?? "KG"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">Fare details unavailable</p>
              )}
            </div>

            {/* Important info */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-text-primary">Important Information</h2>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li className="flex gap-2">
                  <span className="shrink-0 text-primary-600">•</span>
                  <span>Please arrive at the airport at least 3 hours before international flights and 2 hours for domestic.</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-primary-600">•</span>
                  <span>Baggage allowance varies by airline and ticket type. Check with the airline for details.</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-primary-600">•</span>
                  <span>Online check-in opens 24 hours before departure for most airlines.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right sidebar (lg:col-span-1) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg border border-border-light">
              {/* Price section */}
              <div className="mb-6">
                <p className="text-sm text-text-secondary mb-1">Total Price</p>
                <p className="text-3xl font-bold text-primary-700">{formattedPrice}</p>
                <p className="text-xs text-text-muted mt-1">for {flight.itineraries.length > 1 ? "1 adult round-trip" : "1 adult"}</p>
              </div>

              {/* Trip details */}
              <div className="mb-6 space-y-3 rounded-xl bg-background-light p-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
                    {isRoundTrip ? "Outbound" : "Departure"}
                  </p>
                  <p className="font-semibold text-text-primary">{formatTime(firstDep?.departure.at)}</p>
                  <p className="text-text-secondary">{firstDep?.departure.iataCode} → {firstArr?.arrival.iataCode}</p>
                  <p className="text-text-muted text-xs">{formatFullDate(firstDep?.departure.at)}</p>
                </div>

                {isRoundTrip && secondDep && (
                  <div className="border-t border-border-light pt-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">Return</p>
                    <p className="font-semibold text-text-primary">{formatTime(secondDep.departure.at)}</p>
                    <p className="text-text-secondary">{secondDep.departure.iataCode} → {secondArr?.arrival.iataCode}</p>
                    <p className="text-text-muted text-xs">{formatFullDate(secondDep.departure.at)}</p>
                  </div>
                )}
              </div>

              {/* Urgency signals */}
              {firstStops === 0 && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-600" />
                  Non-stop flight
                </div>
              )}

              {/* CTA button */}
              <button className="w-full rounded-xl bg-primary-600 px-4 py-3 font-semibold text-white hover:bg-primary-700 transition-colors">
                Continue to Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
