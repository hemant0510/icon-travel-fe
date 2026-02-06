type FlightSkeletonProps = {
  count?: number;
};

export default function FlightSkeleton({ count = 3 }: FlightSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="glass-card flex flex-col gap-3 p-5"
        >
          <div className="h-3 w-24 rounded-full bg-primary-100 animate-shimmer" />
          <div className="h-5 w-40 rounded-full bg-primary-50 animate-shimmer" />
          <div className="flex gap-2">
            <div className="h-4 w-20 rounded-full bg-primary-50 animate-shimmer" />
            <div className="h-4 w-20 rounded-full bg-accent-50 animate-shimmer" />
            <div className="h-4 w-24 rounded-full bg-surface-dim animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
