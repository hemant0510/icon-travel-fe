"use client";

import { useState } from "react";
import type { UnifiedFlight, FlightItinerary, FlightSegment } from "@/types/flight";
import {
  Plane,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
} from "lucide-react";

/* ── helpers ──────────────────────────────────────────────── */

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

/** Total stops across all segments in an itinerary */
function totalStops(segments: FlightSegment[]): number {
  // Each segment's own stops (mid-route technical stops) + connections between segments
  const segStops = segments.reduce((sum, s) => sum + (s.stops ?? 0), 0);
  const connections = Math.max(0, segments.length - 1);
  return segStops + connections;
}

/** Stops badge colour */
function stopsColor(stops: number) {
  if (stops === 0) return "bg-green-100 text-green-700";
  if (stops === 1) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}

/** Stops label */
function stopsLabel(stops: number) {
  if (stops === 0) return "Non Stop";
  if (stops === 1) return "1 Stop";
  return `${stops} Stops`;
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

/* ── sub-components ───────────────────────────────────────── */

function ItineraryRow({
  itinerary,
  label,
  carrierName,
  carrierCode,
}: {
  itinerary: FlightItinerary;
  label?: string;
  carrierName?: string;
  carrierCode?: string;
}) {
  const segs = itinerary.segments;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const stops = totalStops(segs);
  const flightNo = first ? `${first.carrierCode ?? ""}‑${first.number ?? ""}` : "";

  return (
    <div className="flex flex-col gap-1">
      {/* Label (DEPARTURE / RETURN) */}
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
          {label}
        </span>
      )}

      {/* Airline + flight number */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-100">
          <Plane size={14} className="text-primary-600" />
        </div>
        <span className="text-xs font-semibold text-text-primary">
          {carrierName ?? carrierCode ?? "Airline"}
        </span>
        {flightNo && (
          <span className="text-[11px] text-text-muted">{flightNo}</span>
        )}
      </div>

      {/* Time row: Dep ─── Duration ─── Arr */}
      <div className="mt-1 flex items-center gap-2">
        {/* Departure */}
        <div className="min-w-[60px]">
          <p className="text-lg font-bold leading-tight text-text-primary">
            {formatTime(first?.departure.at)}
          </p>
          <p className="text-[11px] font-medium text-text-secondary">
            {first?.departure.iataCode}
          </p>
        </div>

        {/* Center: duration + line + stops */}
        <div className="flex flex-1 flex-col items-center gap-0.5">
          <span className="text-[11px] text-text-muted">{formatDuration(itinerary.duration)}</span>
          <div className="relative flex w-full items-center">
            <span className="h-px flex-1 bg-border" />
            <Plane size={12} className="mx-1 text-primary-500" />
            <span className="h-px flex-1 bg-border" />
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${stopsColor(stops)}`}>
            {stopsLabel(stops)}
          </span>
        </div>

        {/* Arrival */}
        <div className="min-w-[60px] text-right">
          <p className="text-lg font-bold leading-tight text-text-primary">
            {formatTime(last?.arrival.at)}
          </p>
          <p className="text-[11px] font-medium text-text-secondary">
            {last?.arrival.iataCode}
          </p>
        </div>
      </div>

      {/* Date row */}
      <div className="flex justify-between text-[10px] text-text-muted">
        <span>{formatDate(first?.departure.at)}</span>
        <span>{formatDate(last?.arrival.at)}</span>
      </div>
    </div>
  );
}

function SegmentDetail({ segments }: { segments: FlightSegment[] }) {
  return (
    <div className="flex flex-col gap-3">
      {segments.map((seg, idx) => (
        <div key={idx}>
          {/* Layover banner */}
          {idx > 0 && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
              <Clock size={12} />
              <span>
                Layover at <strong>{seg.departure.iataCode}</strong>{" "}
                &mdash; {layoverDuration(segments[idx - 1], seg)}
              </span>
            </div>
          )}

          <div className="flex items-start gap-3">
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-500" />
              <span className="h-full w-px bg-primary-200" />
              <span className="h-2.5 w-2.5 rounded-full border-2 border-primary-500 bg-white" />
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col gap-1 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">
                  {formatTime(seg.departure.at)}
                </span>
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
                <span className="font-bold text-text-primary">
                  {formatTime(seg.arrival.at)}
                </span>
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

/* ── main card ────────────────────────────────────────────── */

type FlightCardProps = {
  flight: UnifiedFlight;
  index: number;
};

export default function FlightCard({ flight, index }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [priceDetail, setPriceDetail] = useState<Record<string, unknown> | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const isRoundTrip = flight.itineraries.length > 1;

  const formattedPrice = Number.isNaN(Number(flight.priceTotal))
    ? `${flight.currency ?? "INR"} ${flight.priceTotal}`
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: flight.currency ?? "INR",
      }).format(Number(flight.priceTotal));

  const handleToggleDetails = async () => {
    const willOpen = !expanded;
    setExpanded(willOpen);

    // Fetch pricing details on first expand if raw offer exists
    if (willOpen && !priceDetail && flight.rawOffer) {
      setPriceLoading(true);
      try {
        const res = await fetch("/api/flights/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flightOffer: flight.rawOffer }),
        });
        if (res.ok) {
          const json = await res.json();
          setPriceDetail(json.data ?? null);
        }
      } catch {
        // silently fail — we still show segment info
      } finally {
        setPriceLoading(false);
      }
    }
  };

  /* price detail extraction */
  const fareBreakdown = (() => {
    if (!priceDetail) return null;
    const offers = (priceDetail as Record<string, unknown>).flightOffers as Array<Record<string, unknown>> | undefined;
    if (!offers?.[0]) return null;
    const price = offers[0].price as { currency?: string; total?: string; base?: string; grandTotal?: string } | undefined;
    const travelers = offers[0].travelerPricings as Array<{
      travelerType?: string;
      fareDetailsBySegment?: Array<{
        cabin?: string;
        class?: string;
        includedCheckedBags?: { quantity?: number; weight?: number; weightUnit?: string };
      }>;
    }> | undefined;
    return { price, travelers };
  })();

  return (
    <article
      className="glass-card overflow-hidden transition-all duration-300 hover:glass-card-hover animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Main content */}
      <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch">
        {/* Left: itineraries */}
        <div className="flex flex-1 flex-col gap-0 p-4 sm:p-5">
          <ItineraryRow
            itinerary={flight.itineraries[0]}
            label={isRoundTrip ? "Departure" : undefined}
            carrierName={flight.carrierName}
            carrierCode={flight.carrierCode}
          />

          {isRoundTrip && flight.itineraries[1] && (
            <>
              <div className="my-3 border-t border-dashed border-border" />
              <ItineraryRow
                itinerary={flight.itineraries[1]}
                label="Return"
                carrierName={flight.carrierName}
                carrierCode={flight.carrierCode}
              />
            </>
          )}
        </div>

        {/* Right: price */}
        <div className="flex shrink-0 flex-col items-end justify-center border-t border-border-light p-4 sm:w-40 sm:border-l sm:border-t-0 sm:p-5">
          <p className="text-xl font-bold text-primary-700">{formattedPrice}</p>
          <p className="text-[11px] text-text-muted">per adult</p>
        </div>
      </div>

      {/* Flight Details toggle */}
      <div className="border-t border-border-light">
        <button
          type="button"
          onClick={handleToggleDetails}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50"
        >
          Flight Details
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border-light bg-surface-dim px-4 py-4 sm:px-5">
          {/* Itinerary segments */}
          {flight.itineraries.map((itin, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              {flight.itineraries.length > 1 && (
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">
                  {idx === 0 ? "Departure" : "Return"} &mdash; {formatDuration(itin.duration)}
                </p>
              )}
              <SegmentDetail segments={itin.segments} />
            </div>
          ))}

          {/* Fare breakdown from pricing API */}
          {priceLoading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
              <Loader2 size={14} className="animate-spin" />
              Loading fare details...
            </div>
          )}

          {fareBreakdown?.price && (
            <div className="mt-3 rounded-lg border border-border-light bg-white p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                Fare Breakdown
              </p>
              <div className="flex flex-col gap-1 text-sm">
                {fareBreakdown.price.base && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Base Fare</span>
                    <span className="font-medium text-text-primary">
                      {fareBreakdown.price.currency} {fareBreakdown.price.base}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-secondary">Taxes & Fees</span>
                  <span className="font-medium text-text-primary">
                    {fareBreakdown.price.currency}{" "}
                    {fareBreakdown.price.base && fareBreakdown.price.total
                      ? (Number(fareBreakdown.price.total) - Number(fareBreakdown.price.base)).toFixed(2)
                      : "--"}
                  </span>
                </div>
                <div className="mt-1 flex justify-between border-t border-border-light pt-1">
                  <span className="font-semibold text-text-primary">Total</span>
                  <span className="font-bold text-primary-700">
                    {fareBreakdown.price.currency} {fareBreakdown.price.grandTotal ?? fareBreakdown.price.total}
                  </span>
                </div>
              </div>

              {/* Cabin & baggage from traveler pricing */}
              {fareBreakdown.travelers?.[0]?.fareDetailsBySegment?.[0] && (() => {
                const detail = fareBreakdown.travelers![0].fareDetailsBySegment![0];
                return (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    {detail.cabin && (
                      <span className="rounded-full bg-primary-50 px-2.5 py-0.5 font-medium text-primary-600">
                        {detail.cabin}
                      </span>
                    )}
                    {detail.includedCheckedBags?.quantity != null && (
                      <span className="rounded-full bg-green-50 px-2.5 py-0.5 font-medium text-green-700">
                        {detail.includedCheckedBags.quantity} checked bag(s)
                      </span>
                    )}
                    {detail.includedCheckedBags?.weight != null && (
                      <span className="rounded-full bg-green-50 px-2.5 py-0.5 font-medium text-green-700">
                        {detail.includedCheckedBags.weight} {detail.includedCheckedBags.weightUnit ?? "KG"}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
