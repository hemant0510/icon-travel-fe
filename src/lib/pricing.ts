import { cookies } from "next/headers";
import { getCurrencyFromCookieStore } from "@/lib/currency";

export async function getPricingParams() {
  const currencyCode = await getCurrencyFromCookieStore(cookies());
  return { currencyCode };
}
