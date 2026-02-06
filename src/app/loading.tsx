import { Plane } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary animate-pulse-soft">
        <Plane className="text-white" size={28} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-text-secondary">Loading...</p>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-primary-100">
          <div className="h-full w-1/2 rounded-full gradient-primary animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
