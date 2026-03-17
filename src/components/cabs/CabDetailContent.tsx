"use client";

import { useCabDetail } from "@/hooks/useCabDetail";
import { 
  ArrowLeft, 
  Users, 
  Briefcase, 
  Clock, 
  MapPin,
  Check,
  Car,
  Zap,
  Truck,
  Crown,
  Building2,
  Shield,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { VehicleCode } from "@/types/cab";
import BookingGate from "@/components/auth/BookingGate";

const vehicleCodeLabels: Record<string, string> = {
  SDN: "Sedan",
  ELC: "Electric",
  CAR: "Car",
  SUV: "SUV",
  VAN: "Van",
  LMS: "Limousine",
  BUS: "Bus",
};

const vehicleCodeIcons: Record<VehicleCode, typeof Car> = {
  SDN: Car,
  ELC: Zap,
  CAR: Car,
  SUV: Truck,
  VAN: Truck,
  LMS: Crown,
  BUS: Truck,
};

const vehicleFallbacks: Record<VehicleCode, { gradient: string; icon: typeof Car }> = {
  SDN: { gradient: "from-blue-500/80 to-blue-700/90", icon: Car },
  ELC: { gradient: "from-emerald-500/80 to-teal-700/90", icon: Zap },
  CAR: { gradient: "from-primary-400/80 to-primary-600/90", icon: Car },
  SUV: { gradient: "from-slate-500/80 to-slate-700/90", icon: Truck },
  VAN: { gradient: "from-indigo-500/80 to-indigo-700/90", icon: Truck },
  LMS: { gradient: "from-amber-500/80 to-amber-700/90", icon: Crown },
  BUS: { gradient: "from-violet-500/80 to-violet-700/90", icon: Truck },
};

function formatDuration(iso?: string, minutes?: number): string | null {
  if (minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }
  if (iso) return iso.replace("PT", "").replace("H", "h ").replace("M", "m").trim();
  return null;
}

function VehicleHeroImage({ vehicle }: { vehicle: { imageUrl?: string; vehicleCode: VehicleCode; name: string } }) {
  if (vehicle.imageUrl) {
    return (
      <img
        src={vehicle.imageUrl}
        alt={vehicle.name}
        className="h-full w-full object-contain p-4"
      />
    );
  }

  const fallback = vehicleFallbacks[vehicle.vehicleCode] || vehicleFallbacks.CAR;
  const FallbackIcon = fallback.icon;

  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${fallback.gradient}`}>
      <FallbackIcon className="text-white/40" size={64} />
    </div>
  );
}

type CabDetailContentProps = {
  transferId: string;
};

export default function CabDetailContent({ transferId }: CabDetailContentProps) {
  const { vehicle, loading, error } = useCabDetail(transferId);
  const searchParams = useSearchParams();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-background-light pb-20 pt-24">
        <div className="mx-auto max-w-7xl px-4">
          <Link
            href={`/cabs?${searchParams.toString()}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary-600"
          >
            <ArrowLeft size={16} />
            Back to results
          </Link>
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <AlertCircle className="mt-1 shrink-0 text-red-500" size={24} />
              <div>
                <h2 className="mb-2 text-lg font-semibold text-text-primary">
                  Unable to load transfer details
                </h2>
                <p className="text-sm text-text-secondary">
                  {error || "The transfer details could not be found."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const duration = formatDuration(vehicle.duration, vehicle.durationMinutes);
  const fallback = vehicleFallbacks[vehicle.vehicleCode] || vehicleFallbacks.CAR;

  return (
    <div className="min-h-screen bg-background-light pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Back link */}
        <Link
          href={`/cabs?${searchParams.toString()}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary-600"
        >
          <ArrowLeft size={16} />
          Back to results
        </Link>

        {/* Grid: main + sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main column (lg:col-span-2) */}
          <div className="lg:col-span-2">
            {/* Header block */}
            <div className="mb-6">
              <h1 className="mb-2 text-3xl font-bold text-text-primary">
                {vehicle.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-primary-700">
                  {vehicle.categoryLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-text-secondary">
                  {vehicleCodeLabels[vehicle.vehicleCode] || vehicle.vehicleCode}
                </span>
                <span className="inline-flex items-center gap-1 text-text-secondary">
                  <Building2 size={14} />
                  {vehicle.provider?.name}
                </span>
                <span className="inline-flex items-center gap-1 text-text-secondary">
                  <Shield size={14} />
                  {vehicle.transferType === "SHARED" ? "Shared Transfer" : "Private Transfer"}
                </span>
              </div>
            </div>

            {/* Hero section with vehicle image */}
            <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="aspect-video w-full bg-background-light">
                <VehicleHeroImage vehicle={vehicle} />
              </div>
              {vehicle.provider?.logoUrl && (
                <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/90 shadow-sm backdrop-blur-sm">
                  <img
                    src={vehicle.provider.logoUrl}
                    alt={vehicle.provider.name}
                    className="h-8 w-8 object-contain"
                  />
                </div>
              )}
            </div>

            {/* Vehicle specs */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-text-primary">
                Vehicle Specifications
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Users className="text-primary-600" size={20} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Passengers
                    </p>
                    <p className="text-sm font-semibold text-text-primary">
                      {vehicle.seats} seats
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="text-primary-600" size={20} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Luggage
                    </p>
                    <p className="text-sm font-semibold text-text-primary">
                      {vehicle.bags} bags
                    </p>
                  </div>
                </div>
                {duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="text-primary-600" size={20} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Duration
                      </p>
                      <p className="text-sm font-semibold text-text-primary">
                        {duration}
                      </p>
                    </div>
                  </div>
                )}
                {vehicle.distance && (
                  <div className="flex items-center gap-3">
                    <MapPin className="text-primary-600" size={20} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Distance
                      </p>
                      <p className="text-sm font-semibold text-text-primary">
                        {vehicle.distance.value} {vehicle.distance.unit}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* What's included */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-text-primary">
                What's Included
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                  <span className="text-sm text-text-secondary">
                    Professional driver
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                  <span className="text-sm text-text-secondary">
                    Vehicle insurance
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                  <span className="text-sm text-text-secondary">
                    Tolls and taxes included
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                  <span className="text-sm text-text-secondary">
                    Meet and greet service
                  </span>
                </li>
              </ul>
            </div>

            {/* Cancellation policy */}
            {vehicle.cancellationRules && vehicle.cancellationRules.length > 0 && (
              <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-text-primary">
                  Cancellation Policy
                </h2>
                <div className="space-y-3">
                  {vehicle.cancellationRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg bg-background-light p-3"
                    >
                      <AlertCircle
                        className="mt-0.5 shrink-0 text-amber-600"
                        size={18}
                      />
                      <div className="flex-1">
                        {rule.ruleDescription && (
                          <p className="text-sm font-medium text-text-primary">
                            {rule.ruleDescription}
                          </p>
                        )}
                        {rule.feeValue && (
                          <p className="mt-1 text-xs text-text-secondary">
                            Fee: {rule.feeValue}
                            {rule.currencyCode && ` ${rule.currencyCode}`}
                          </p>
                        )}
                        {rule.feeType && (
                          <p className="text-xs text-text-muted">
                            Type: {rule.feeType}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (lg:col-span-1) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border-light bg-white p-6 shadow-lg">
              {/* Price section */}
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Total Price
                </p>
                <p className="mt-1 text-3xl font-bold text-primary-700">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: vehicle.currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: vehicle.price < 100 ? 2 : 0,
                  }).format(vehicle.price)}
                </p>
              </div>

              {/* Trip summary */}
              <div className="mb-6 space-y-3 rounded-xl bg-background-light p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Vehicle</span>
                  <span className="font-medium text-text-primary">{vehicle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Type</span>
                  <span className="font-medium text-text-primary">
                    {vehicle.transferType === "SHARED" ? "Shared" : "Private"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Passengers</span>
                  <span className="font-medium text-text-primary">{vehicle.seats}</span>
                </div>
                {duration && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Duration</span>
                    <span className="font-medium text-text-primary">{duration}</span>
                  </div>
                )}
                {vehicle.distance && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Distance</span>
                    <span className="font-medium text-text-primary">
                      {vehicle.distance.value} {vehicle.distance.unit}
                    </span>
                  </div>
                )}
                <div className="border-t border-border-light pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-text-primary">Total</span>
                    <span className="font-bold text-primary-700">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: vehicle.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: vehicle.price < 100 ? 2 : 0,
                      }).format(vehicle.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <BookingGate className="w-full rounded-lg bg-primary-600 px-4 py-3 text-center font-semibold text-white transition-all hover:bg-primary-700 active:scale-[0.97]">
                Book Now
              </BookingGate>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
