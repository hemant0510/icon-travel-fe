import "server-only";
import Amadeus from "amadeus";

/**
 * Creates a fresh Amadeus client instance per request.
 * 
 * SECURITY: Previously used a module-level singleton that persisted across
 * serverless function invocations, risking token/state leaks between users.
 * Now creates a new instance per call to ensure isolation.
 */
export const getAmadeusClient = (): Amadeus | null => {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  const hostname =
    process.env.AMADEUS_HOSTNAME ??
    (process.env.NODE_ENV === "development" ? "test" : undefined);

  if (!clientId || !clientSecret) {
    console.error('Amadeus credentials not found in environment variables');
    return null;
  }

  // Create a fresh instance per request — no caching
  return new Amadeus({
    clientId,
    clientSecret,
    hostname,
  });
};
