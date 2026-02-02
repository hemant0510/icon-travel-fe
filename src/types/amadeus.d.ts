declare module "amadeus" {
  type AmadeusOptions = {
    clientId: string;
    clientSecret: string;
    hostname?: string;
  };

  type AmadeusResponse = {
    statusCode?: number;
    result: unknown;
  };

  class Amadeus {
    constructor(options: AmadeusOptions);
    shopping: {
      flightOffersSearch: {
        get: (params: Record<string, string | number | undefined>) => Promise<AmadeusResponse>;
      };
    };
    referenceData: {
      locations: {
        get: (params: Record<string, string | number | undefined>) => Promise<AmadeusResponse>;
      };
    };
  }

  export default Amadeus;
}
