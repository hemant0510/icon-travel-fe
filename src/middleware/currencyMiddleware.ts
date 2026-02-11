import { NextResponse, type NextRequest } from "next/server";
import { resolveCurrencyFromHeaders, normalizeCurrencyCode } from "@/lib/currency";

export function middleware(request: NextRequest) {
  const existingOverride = request.cookies.get("user-currency")?.value;
  const existingCurrency = request.cookies.get("currency")?.value;
  const normalizedOverride = normalizeCurrencyCode(existingOverride);
  const cookieOptions = {
    path: "/",
    sameSite: "lax" as const,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  };

  if (existingOverride && normalizedOverride) {
    if (existingCurrency !== normalizedOverride) {
      const response = NextResponse.next();
      response.cookies.set("currency", normalizedOverride, cookieOptions);
      return response;
    }
    return NextResponse.next();
  }

  const resolvedCurrency = resolveCurrencyFromHeaders(request.headers);

  // Debug logging for currency resolution
  if (process.env.NODE_ENV === "development") {
    console.log("--- Currency Middleware Debug ---");
    console.log("Cookies - user-currency:", existingOverride, "currency:", existingCurrency);
    console.log("Headers - x-vercel-ip-country:", request.headers.get("x-vercel-ip-country"));
    console.log("Headers - accept-language:", request.headers.get("accept-language"));
    console.log("Resolved Currency:", resolvedCurrency);
    console.log("---------------------------------");
  }

  if (!existingCurrency || existingCurrency !== resolvedCurrency) {
    const response = NextResponse.next();
    response.cookies.set("currency", resolvedCurrency, cookieOptions);
    return response;
  }

  return NextResponse.next();
}
