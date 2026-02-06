import { Car } from "lucide-react";
import CabSearchForm from "@/components/cabs/CabSearchForm";
import CabResults from "@/components/cabs/CabResults";
import { mockVehicles } from "@/data/mockVehicles";

export default function CabsPage() {
  return (
    <div>
      {/* Gradient header */}
      <div className="gradient-hero px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Car className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Cabs & Transfers
              </h1>
              <p className="text-sm text-white/70">
                Reliable rides for airport transfers, city tours, and more
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <CabSearchForm />
          <CabResults vehicles={mockVehicles} />
        </div>
      </div>
    </div>
  );
}
