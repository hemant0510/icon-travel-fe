import { DEFAULT_CURRENCY, normalizeCurrencyCode, type CurrencyRates } from "@/lib/currency";

const DEFAULT_TEMPLATE = "https://open.er-api.com/v6/latest/{base}";
const CACHE_TTL_SECONDS = 60 * 60;

// Simple in-memory cache for server-side usage
// In a real production environment with multiple pods/serverless, this should be Redis
let serverCachedRates: {
  [base: string]: {
    data: CurrencyRates;
    fetchedAt: number;
  };
} = {};

export async function fetchCurrencyRates(base: string = DEFAULT_CURRENCY): Promise<CurrencyRates | null> {
  const normalizedBase = normalizeCurrencyCode(base);
  const now = Date.now();
  const cached = serverCachedRates[normalizedBase];

  if (cached && now - cached.fetchedAt < CACHE_TTL_SECONDS * 1000) {
    return cached.data;
  }

  try {
    const url = (process.env.CURRENCY_RATES_URL || DEFAULT_TEMPLATE).replace("{base}", normalizedBase);
    const res = await fetch(url, { next: { revalidate: CACHE_TTL_SECONDS } });
    
    if (!res.ok) {
      console.error(`Failed to fetch rates from ${url}: ${res.statusText}`);
      return cached?.data ?? null;
    }

    const json = await res.json();
    if (!json || typeof json.rates !== "object") {
      return cached?.data ?? null;
    }

    const ratesData: CurrencyRates = {
      base: normalizeCurrencyCode(json.base_code ?? json.base ?? normalizedBase),
      rates: json.rates,
      updatedAt: json.time_last_update_utc ?? new Date().toISOString(),
    };

    serverCachedRates[normalizedBase] = {
      data: ratesData,
      fetchedAt: now,
    };

    return ratesData;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    return cached?.data ?? null;
  }
}
