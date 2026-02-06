import { MapPin } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const destinations = [
  { name: "Goa", tag: "Beaches", gradient: "from-cyan-400 to-blue-500" },
  { name: "Dubai", tag: "Luxury", gradient: "from-amber-400 to-orange-500" },
  { name: "Bangkok", tag: "Culture", gradient: "from-pink-400 to-rose-500" },
  { name: "Maldives", tag: "Islands", gradient: "from-teal-400 to-emerald-500" },
  { name: "Singapore", tag: "City", gradient: "from-violet-400 to-purple-500" },
  { name: "Bali", tag: "Nature", gradient: "from-green-400 to-teal-500" },
  { name: "Paris", tag: "Romance", gradient: "from-rose-400 to-pink-500" },
  { name: "London", tag: "Heritage", gradient: "from-slate-400 to-slate-600" },
];

export default function PopularDestinations() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
          Popular <span className="gradient-text">Destinations</span>
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Discover trending places loved by travellers worldwide
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
        {destinations.map((dest, i) => (
          <GlassCard key={dest.name} hover>
            <div className="group cursor-pointer p-1">
              {/* Gradient placeholder image */}
              <div
                className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${dest.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]`}
              >
                <MapPin className="text-white/50" size={32} />
              </div>
              <div className="px-2 py-3">
                <h3 className="font-semibold text-text-primary">{dest.name}</h3>
                <span className="inline-block mt-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600">
                  {dest.tag}
                </span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
