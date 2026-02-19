"use client";

import CabSearchForm from "@/components/cabs/CabSearchForm";
import CabResults from "@/components/cabs/CabResults";
import CabFilters from "@/components/cabs/CabFilters";
import { useTransferSearch } from "@/hooks/useTransferSearch";

export default function CabPageContent() {
  const { vehicles, loading, error, hasSearched, search } = useTransferSearch();

  return (
    <div className="flex flex-col gap-6">
      <CabSearchForm onSearch={search} loading={loading} error={error} />

      {hasSearched && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="order-2 lg:order-1">
            <CabFilters />
          </aside>
          <div className="order-1 lg:order-2">
            <CabResults vehicles={vehicles} loading={loading} hasSearched={hasSearched} />
          </div>
        </div>
      )}

      {!hasSearched && (
        <CabResults vehicles={[]} loading={false} hasSearched={false} />
      )}
    </div>
  );
}
