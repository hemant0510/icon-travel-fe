import "server-only";
import Amadeus from "amadeus";

let amadeusInstance: Amadeus | null = null;

export const getAmadeusClient = () => {
  if (amadeusInstance) {
    return amadeusInstance;
  }

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  const hostname =
    process.env.AMADEUS_HOSTNAME ??
    (process.env.NODE_ENV === "development" ? "test" : undefined);

  if (!clientId || !clientSecret) {
    return null;
  }

  amadeusInstance = new Amadeus({
    clientId,
    clientSecret,
    hostname,
  });

  return amadeusInstance;
};
