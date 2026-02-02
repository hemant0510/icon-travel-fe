import { z } from "zod";

export const airportDictionarySchema = z.record(
  z.string(),
  z.object({
    cityCode: z.string().optional(),
    cityName: z.string().optional(),
    name: z.string().optional(),
    countryCode: z.string().optional(),
  })
);

export const carrierDictionarySchema = z.record(z.string(), z.string());

export const flightSegmentSchema = z.object({
  departure: z.object({
    iataCode: z.string(),
    at: z.string(),
  }),
  arrival: z.object({
    iataCode: z.string(),
    at: z.string(),
  }),
  carrierCode: z.string().optional(),
  number: z.string().optional(),
  duration: z.string().optional(),
  numberOfStops: z.number().optional(),
});

export const flightOfferSchema = z.object({
  id: z.string(),
  price: z
    .object({
      total: z.string().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  itineraries: z.array(
    z.object({
      duration: z.string().optional(),
      segments: z.array(flightSegmentSchema),
    })
  ),
  validatingAirlineCodes: z.array(z.string()).optional(),
});

export const flightSearchResponseSchema = z.object({
  data: z.array(flightOfferSchema).optional(),
  dictionaries: z
    .object({
      locations: airportDictionarySchema.optional(),
      carriers: carrierDictionarySchema.optional(),
    })
    .optional(),
});
