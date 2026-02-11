import { middleware as currencyMiddleware } from "./src/middleware/currencyMiddleware";

export function middleware(request: Parameters<typeof currencyMiddleware>[0]) {
  return currencyMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|manifest.json|icons|sw.js).*)"],
};
