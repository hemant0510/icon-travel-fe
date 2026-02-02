import FlightSkeleton from "@/components/FlightSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        <FlightSkeleton count={4} />
      </div>
    </div>
  );
}
