import countryToCurrency from "country-to-currency";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const rawDefaultCurrency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY;
const normalizedDefaultCurrency = String(rawDefaultCurrency ?? "INR").toUpperCase();
const supportedCurrencySet = new Set(Object.values(countryToCurrency as Record<string, string>));

export const DEFAULT_CURRENCY = supportedCurrencySet.has(normalizedDefaultCurrency)
  ? normalizedDefaultCurrency
  : "INR";

type CurrencyOption = {
  code: string;
  label: string;
  symbol: string;
};

let cachedSupportedCurrencies: CurrencyOption[] | null = null;
let cachedRates:
  | { base: string; rates: Record<string, number>; updatedAt?: string; fetchedAt: number }
  | null = null;
const RATES_TTL_MS = 60 * 60 * 1000;

export type CurrencyRates = {
  base: string;
  rates: Record<string, number>;
  updatedAt?: string;
};

export function normalizeCurrencyCode(value?: string | null) {
  const code = String(value ?? "").toUpperCase();
  if (getSupportedCurrencies().some((currency) => currency.code === code)) return code;
  return DEFAULT_CURRENCY;
}

export function resolveCurrencyFromCountry(countryCode?: string | null) {
  const code = String(countryCode ?? "").toUpperCase();
  if (!code) return DEFAULT_CURRENCY;
  const mapped = (countryToCurrency as Record<string, string>)[code];
  return normalizeCurrencyCode(mapped);
}

function getCountryFromAcceptLanguage(value?: string | null) {
  const locale = value?.split(",")[0]?.split(";")[0]?.trim();
  if (!locale) return undefined;
  const normalized = locale.replace("_", "-");
  const parts = normalized.split("-");
  if (parts.length < 2) return undefined;
  const region = parts[1];
  if (region.length !== 2) return undefined;
  return region.toUpperCase();
}

export function resolveCurrencyFromHeaders(headers: Headers) {
  const headerCountry =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code");
  if (headerCountry) return resolveCurrencyFromCountry(headerCountry);
  const acceptLanguageCountry = getCountryFromAcceptLanguage(headers.get("accept-language"));
  if (acceptLanguageCountry) return resolveCurrencyFromCountry(acceptLanguageCountry);
  return DEFAULT_CURRENCY;
}

export function convertCurrencyAmount(amount: number, from: string, to: string, rates: CurrencyRates) {
  const fromCode = normalizeCurrencyCode(from);
  const toCode = normalizeCurrencyCode(to);
  if (fromCode === toCode) return amount;
  const base = normalizeCurrencyCode(rates.base ?? DEFAULT_CURRENCY);
  const fromRate = fromCode === base ? 1 : rates.rates[fromCode];
  const toRate = toCode === base ? 1 : rates.rates[toCode];
  if (!fromRate || !toRate) return amount;
  const amountInBase = amount / fromRate;
  return amountInBase * toRate;
}

export async function getCurrencyRates(base: string = DEFAULT_CURRENCY): Promise<CurrencyRates | null> {
  const normalizedBase = normalizeCurrencyCode(base);
  if (
    cachedRates &&
    cachedRates.base === normalizedBase &&
    Date.now() - cachedRates.fetchedAt < RATES_TTL_MS
  ) {
    return cachedRates;
  }
  if (typeof fetch === "undefined") return cachedRates;
  try {
    const res = await fetch(`/api/currency/rates?base=${normalizedBase}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) return cachedRates;
    const json = (await res.json()) as CurrencyRates | null;
    if (!json?.rates) return cachedRates;
    cachedRates = {
      base: normalizeCurrencyCode(json.base ?? normalizedBase),
      rates: json.rates,
      updatedAt: json.updatedAt,
      fetchedAt: Date.now(),
    };
    return cachedRates;
  } catch {
    return cachedRates;
  }
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function getCurrencyLabel(code: string) {
  return getSupportedCurrencies().find((currency) => currency.code === code)?.label ?? code;
}

export function getCurrencySymbol(code: string) {
  try {
    const parts = new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((part) => part.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

export function getSupportedCurrencies() {
  if (cachedSupportedCurrencies) return cachedSupportedCurrencies;
  const codes = Array.from(supportedCurrencySet);
  const options = codes.map((code) => {
    const symbol = getCurrencySymbol(code);
    return { code, label: `${code} (${symbol})`, symbol };
  });
  if (!options.some((option) => option.code === DEFAULT_CURRENCY)) {
    const symbol = getCurrencySymbol(DEFAULT_CURRENCY);
    options.push({ code: DEFAULT_CURRENCY, label: `${DEFAULT_CURRENCY} (${symbol})`, symbol });
  }
  options.sort((a, b) => a.code.localeCompare(b.code));
  const defaultIndex = options.findIndex((option) => option.code === DEFAULT_CURRENCY);
  if (defaultIndex > 0) {
    const [defaultOption] = options.splice(defaultIndex, 1);
    options.unshift(defaultOption);
  }
  cachedSupportedCurrencies = options;
  return cachedSupportedCurrencies;
}

export function getCookieCurrency(cookieValue?: string | null) {
  return normalizeCurrencyCode(cookieValue);
}

export async function getCurrencyFromCookieStore(
  cookieStore: { get: (name: string) => { value: string } | undefined } | Promise<{ get: (name: string) => { value: string } | undefined }>
) {
  const resolvedStore = await cookieStore;
  const override = resolvedStore.get("user-currency")?.value;
  if (override) return getCookieCurrency(override);
  const auto = resolvedStore.get("currency")?.value;
  if (auto) return getCookieCurrency(auto);
  return DEFAULT_CURRENCY;
}

export async function getCurrencyFromServer(
  cookieStore: ReadonlyRequestCookies,
  headers: Headers
) {
  const override = cookieStore.get("user-currency")?.value;
  if (override) return getCookieCurrency(override);
  const auto = cookieStore.get("currency")?.value;
  if (auto) return getCookieCurrency(auto);
  return resolveCurrencyFromHeaders(headers);
}

export function getCurrencyFromCookieString(cookieString: string) {
  const parts = cookieString.split(";").map((part) => part.trim());
  const cookieMap = new Map(parts.map((part) => {
    const [key, ...rest] = part.split("=");
    return [key, rest.join("=")];
  }));
  const override = cookieMap.get("user-currency");
  if (override) return getCookieCurrency(override);
  const auto = cookieMap.get("currency");
  if (auto) return getCookieCurrency(auto);
  return DEFAULT_CURRENCY;
}

export function setClientCurrencyCookies(currency: string) {
  if (typeof document === "undefined") return;
  const normalized = normalizeCurrencyCode(currency);
  const maxAge = 60 * 60 * 24 * 365;
  const base = `path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `user-currency=${normalized}; ${base}`;
  document.cookie = `currency=${normalized}; ${base}`;
}
