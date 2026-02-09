type FlightSkeletonProps = {
  count?: number;
};

function ShimmerBar({ className }: { className: string }) {
  return <div className={`rounded-full bg-primary-50 animate-shimmer ${className}`} />;
}

export default function FlightSkeleton({ count = 3 }: FlightSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={`skeleton-${index}`}
          className="glass-card overflow-hidden animate-fade-in"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="flex flex-col sm:flex-row sm:items-stretch">
            {/* Left: itinerary skeleton */}
            <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
              {/* Airline row */}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 shrink-0 rounded-md bg-primary-100 animate-shimmer" />
                <ShimmerBar className="h-3.5 w-24" />
                <ShimmerBar className="h-3 w-16" />
              </div>

              {/* Time row: Dep — Duration — Arr */}
              <div className="flex items-center gap-2">
                {/* Departure */}
                <div className="min-w-[60px]">
                  <ShimmerBar className="mb-1 h-5 w-14" />
                  <ShimmerBar className="h-3 w-8" />
                </div>

                {/* Duration + line */}
                <div className="flex flex-1 flex-col items-center gap-1">
                  <ShimmerBar className="h-3 w-12" />
                  <div className="h-px w-full bg-border" />
                  <ShimmerBar className="h-4 w-16 rounded-full" />
                </div>

                {/* Arrival */}
                <div className="min-w-[60px] text-right">
                  <ShimmerBar className="mb-1 ml-auto h-5 w-14" />
                  <ShimmerBar className="ml-auto h-3 w-8" />
                </div>
              </div>

              {/* Date row */}
              <div className="flex justify-between">
                <ShimmerBar className="h-2.5 w-20" />
                <ShimmerBar className="h-2.5 w-20" />
              </div>
            </div>

            {/* Right: price skeleton */}
            <div className="flex shrink-0 flex-col items-end justify-center border-t border-border-light p-4 sm:w-40 sm:border-l sm:border-t-0 sm:p-5">
              <ShimmerBar className="mb-1 h-6 w-20" />
              <ShimmerBar className="h-3 w-12" />
            </div>
          </div>

          {/* Flight Details bar skeleton */}
          <div className="flex items-center justify-center border-t border-border-light px-4 py-2.5">
            <ShimmerBar className="h-3.5 w-24" />
          </div>
        </article>
      ))}
    </div>
  );
}
