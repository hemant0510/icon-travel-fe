import SearchTabs from "./SearchTabs";

type HeroSectionProps = {
  initialCurrency: string;
};

export default function HeroSection({ initialCurrency }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden gradient-hero px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8">
      {/* Decorative floating shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 animate-float" />
        <div className="absolute -left-10 bottom-10 h-56 w-56 rounded-full bg-accent-500/10 animate-float delay-200" />
        <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-white/5 animate-float delay-400" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Headline */}
        <div className="mx-auto mb-10 max-w-2xl text-center animate-fade-in">
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Travel the world with{" "}
            <span className="text-accent-300">Icon Fly</span>
          </h1>
          <p className="mt-4 text-base text-white/70 sm:text-lg">
            Book flights, hotels, and cabs at unbeatable prices.
            Your journey starts here.
          </p>
        </div>

        {/* Search tabs embedded in hero */}
        <div className="animate-slide-up delay-200">
          <SearchTabs initialCurrency={initialCurrency} />
        </div>
      </div>
    </section>
  );
}
