import { Suspense } from "react";
import type { Metadata } from "next";
import CabDetailContent from "@/components/cabs/CabDetailContent";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Transfer Details | IconFly",
  description: "View full transfer details, vehicle specs, and cancellation policy.",
};

type CabDetailPageProps = {
  params: Promise<{ transferId: string }>;
};

/**
 * Cab / Transfer Detail Page (Server Component shell).
 *
 * The full Vehicle object is stored in sessionStorage by CabResults
 * when the user clicks "View Details". CabDetailContent (client) retrieves
 * it by the transferId key.
 */
export default async function CabDetailPage({ params }: CabDetailPageProps) {
  const { transferId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="animate-spin text-primary-600" size={48} />
        </div>
      }
    >
      <CabDetailContent transferId={transferId} />
    </Suspense>
  );
}
