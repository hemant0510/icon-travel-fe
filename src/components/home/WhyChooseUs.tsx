import { BadgePercent, Headphones, ShieldCheck, Globe } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const features = [
  {
    icon: BadgePercent,
    title: "Best Price Guarantee",
    description: "We compare prices across 100+ providers to find you the lowest fares.",
    color: "text-accent-500",
    bg: "bg-accent-50",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our travel experts are available around the clock to assist you.",
    color: "text-primary-600",
    bg: "bg-primary-50",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Your transactions are protected with industry-standard encryption.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Globe,
    title: "500+ Destinations",
    description: "Explore a vast network of destinations across the globe.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
          Why choose <span className="gradient-text">Icon Fly</span>?
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Trusted by thousands of travellers every day
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feat) => (
          <GlassCard key={feat.title} hover>
            <div className="flex flex-col items-center p-6 text-center">
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${feat.bg}`}
              >
                <feat.icon size={26} className={feat.color} />
              </div>
              <h3 className="mb-2 font-semibold text-text-primary">
                {feat.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {feat.description}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
