import { cookies } from "next/headers";
import HeroSection from "@/components/home/HeroSection";
import PopularDestinations from "@/components/home/PopularDestinations";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import { getCurrencyFromCookieStore } from "@/lib/currency";

export default async function Home() {
  const cookieStore = await cookies();
  const initialCurrency = await getCurrencyFromCookieStore(cookieStore);

  return (
    <>
      <HeroSection initialCurrency={initialCurrency} />
      <PopularDestinations />
      <WhyChooseUs />
    </>
  );
}
