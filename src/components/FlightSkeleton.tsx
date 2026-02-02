type FlightSkeletonProps = {
  count?: number;
};

export default function FlightSkeleton({ count = 3 }: FlightSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <div className="h-4 w-32 rounded-full bg-zinc-200" />
          <div className="h-6 w-48 rounded-full bg-zinc-200" />
          <div className="flex gap-2">
            <div className="h-4 w-20 rounded-full bg-zinc-200" />
            <div className="h-4 w-20 rounded-full bg-zinc-200" />
            <div className="h-4 w-20 rounded-full bg-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
