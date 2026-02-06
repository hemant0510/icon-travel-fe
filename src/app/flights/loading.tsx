import FlightSkeleton from "@/components/FlightSkeleton";

export default function FlightsLoading() {
  return (
    <div>
      <div className="gradient-hero px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-48 rounded-lg bg-white/20 animate-pulse-soft" />
          <div className="mt-2 h-4 w-64 rounded-lg bg-white/10 animate-pulse-soft" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <FlightSkeleton count={4} />
      </div>
    </div>
  );
}
