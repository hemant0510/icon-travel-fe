# Amadeus API Reference

> Source: `Postman collection/Amadeus for Developers.postman_collection.json`
> Base URL: `https://test.api.amadeus.com`

---

## Authentication

All endpoints require OAuth 2.0 Bearer token.

### Get Access Token
- **POST** `/v1/security/oauth2/token`
- **Body** (x-www-form-urlencoded):
  - `client_id` (required)
  - `client_secret` (required)
  - `grant_type`: `client_credentials`
- **Response**: `{ "access_token": "...", "expires_in": 1799 }`
- Use token in header: `Authorization: Bearer {access_token}`

### Get Token Info
- **GET** `/v1/security/oauth2/token/{access_token}`

---

## Flights

### Flight Offers Search (GET)
- **GET** `/v2/shopping/flight-offers`
- **Params**:
  - `originLocationCode` (required): IATA code, e.g. `SYD`
  - `destinationLocationCode` (required): IATA code, e.g. `BKK`
  - `departureDate` (required): `YYYY-MM-DD`
  - `returnDate` (optional): `YYYY-MM-DD`
  - `adults` (required): number
  - `includedAirlineCodes` (optional): e.g. `TG`
  - `max` (optional): max results, e.g. `5`

### Flight Offers Search (POST)
- **POST** `/v2/shopping/flight-offers`
- **Headers**: `Content-Type: application/json`, `X-HTTP-Method-Override: GET`
- **Body**:
```json
{
  "currencyCode": "USD",
  "originDestinations": [{
    "id": "1",
    "originLocationCode": "BOS",
    "destinationLocationCode": "MAD",
    "departureDateTimeRange": { "date": "2026-03-15", "time": "10:00:00" }
  }],
  "travelers": [{ "id": "1", "travelerType": "ADULT" }],
  "sources": ["GDS"],
  "searchCriteria": { "maxFlightOffers": 5 }
}
```

### Flight Offers Price
- **POST** `/v1/shopping/flight-offers/pricing`
- **Headers**: `Content-Type: application/json`, `X-HTTP-Method-Override: GET`
- **Body**:
```json
{
  "data": {
    "type": "flight-offers-pricing",
    "flightOffers": [{ /* flight offer from search */ }]
  }
}
```

### Flight Create Orders (Booking)
- **POST** `/v1/booking/flight-orders`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "data": {
    "type": "flight-order",
    "flightOffers": [{ /* priced flight offer */ }],
    "travelers": [{
      "id": "1",
      "dateOfBirth": "1982-01-16",
      "name": { "firstName": "JORGE", "lastName": "GONZALES" },
      "gender": "MALE",
      "contact": {
        "emailAddress": "jorge@email.com",
        "phones": [{ "deviceType": "MOBILE", "countryCallingCode": "34", "number": "480080076" }]
      },
      "documents": [{
        "documentType": "PASSPORT",
        "number": "00000000",
        "expiryDate": "2025-04-14",
        "issuanceCountry": "ES",
        "nationality": "ES",
        "holder": true
      }]
    }]
  }
}
```

### Flight Order Management
- **GET** `/v1/booking/flight-orders/{flightOrderId}` — Retrieve order
- **DELETE** `/v1/booking/flight-orders/{flightOrderId}` — Cancel order

### Seatmap Display (GET)
- **GET** `/v1/shopping/seatmaps`
- **Params**: `flight-orderId` (required)

### Seatmap Display (POST)
- **POST** `/v1/shopping/seatmaps`
- **Headers**: `Content-Type: application/json`, `X-HTTP-Method-Override: GET`
- **Body**: `{ "data": [{ /* flight offer */ }] }`

### Branded Fares Upsell
- **POST** `/v1/shopping/flight-offers/upselling`
- **Headers**: `Content-Type: application/json`, `X-HTTP-Method-Override: GET`
- **Body**:
```json
{
  "data": {
    "type": "flight-offers-upselling",
    "flightOffers": [{ /* flight offer */ }],
    "payments": [{ "brand": "VISA_IXARIS", "binNumber": 123456, "flightOfferIds": [1] }]
  }
}
```

### Flight Price Analysis
- **GET** `/v1/analytics/itinerary-price-metrics`
- **Params**: `originIataCode`, `destinationIataCode`, `departureDate`, `currencyCode`, `oneWay`

### Flight Choice Prediction
- **POST** `/v2/shopping/flight-offers/prediction`
- **Headers**: `Content-Type: application/json`, `X-HTTP-Method-Override: GET`
- **Body**: Array of flight offers

### Flight Inspiration Search
- **GET** `/v1/shopping/flight-destinations`
- **Params**: `origin` (required), `departureDate` (optional)

### Flight Cheapest Date Search
- **GET** `/v1/shopping/flight-dates`
- **Params**: `origin`, `destination`, `departureDate`

### Flight Availabilities Search
- **POST** `/v1/shopping/availability/flight-availabilities`
- **Headers**: `Content-Type: application/json`, `X-HTTP-Method-Override: GET`
- **Body**:
```json
{
  "originDestinations": [{
    "id": "1",
    "originLocationCode": "BOS",
    "destinationLocationCode": "MAD",
    "departureDateTime": { "date": "2026-03-15", "time": "21:15:00" }
  }],
  "travelers": [{ "id": "1", "travelerType": "ADULT" }],
  "sources": ["GDS"]
}
```

### On Demand Flight Status
- **GET** `/v2/schedule/flights`
- **Params**: `carrierCode`, `flightNumber`, `scheduledDepartureDate`

### Flight Delay Prediction
- **GET** `/v1/travel/predictions/flight-delay`
- **Params**: `originLocationCode`, `destinationLocationCode`, `departureDate`, `departureTime`, `arrivalDate`, `arrivalTime`, `aircraftCode`, `carrierCode`, `flightNumber`, `duration`

### Airport On-Time Performance
- **GET** `/v1/airport/predictions/on-time`
- **Params**: `airportCode`, `date`

### Airport & City Search (by keyword)
- **GET** `/v1/reference-data/locations`
- **Params**: `subType` (CITY, AIRPORT), `keyword`, `countryCode` (optional)

### Airport & City Search (by ID)
- **GET** `/v1/reference-data/locations/{locationId}`

### Nearest Airports
- **GET** `/v1/reference-data/locations/airports`
- **Params**: `latitude`, `longitude`

### Airport Routes
- **GET** `/v1/airport/direct-destinations`
- **Params**: `departureAirportCode`, `max` (optional)

### Flight Check-in Links
- **GET** `/v2/reference-data/urls/checkin-links`
- **Params**: `airlineCode`

### Airline Code Lookup
- **GET** `/v1/reference-data/airlines`
- **Params**: `airlineCodes` (comma-separated, e.g. `BA,AIC`)

### Airline Routes
- **GET** `/v1/airline/destinations`
- **Params**: `airlineCode`, `max` (optional)

### Travel Recommendations
- **GET** `/v1/reference-data/recommended-locations`
- **Params**: `cityCodes`, `travelerCountryCode`

---

## Hotels

### Recommended API Flow
1. **Search hotels** (by-city or by-geocode) → get hotel IDs
2. **Get offers** (hotel-offers with hotelIds) → get pricing & availability
3. **Get offer detail** (hotel-offers/{offerId}) → room details
4. **Book** (hotel-orders v2) → create booking

### Hotel List by City
- **GET** `/v1/reference-data/locations/hotels/by-city`
- **Params**:
  - `cityCode` (required): IATA city code, e.g. `DEL`
  - `radius` (optional): default 5
  - `radiusUnit` (optional): `KM` or `MI`
  - `chainCodes` (optional): 2-letter chain codes
  - `amenities` (optional): amenity filter
  - `ratings` (optional): star ratings, comma-separated, e.g. `3,4,5`
  - `hotelSource` (optional): `BEDBANK`, `DIRECTCHAIN`, or `ALL`
- **Response**: Array of `{ hotelId, name, geoCode, address, distance, rating }`

### Hotel List by Geocode
- **GET** `/v1/reference-data/locations/hotels/by-geocode`
- **Params**:
  - `latitude` (required)
  - `longitude` (required)
  - `radius`, `radiusUnit`, `chainCodes`, `amenities`, `ratings`, `hotelSource` (all optional, same as by-city)

### Hotel List by ID
- **GET** `/v1/reference-data/locations/hotels/by-hotels`
- **Params**: `hotelIds` (required): comma-separated Amadeus hotel IDs

### Hotel Offers Search
- **GET** `/v3/shopping/hotel-offers`
- **Params**:
  - `hotelIds` (required): comma-separated hotel IDs from search
  - `adults` (required): number of adults
  - `checkInDate` (optional): `YYYY-MM-DD`
  - `checkOutDate` (optional): `YYYY-MM-DD`
- **Response**: Array of `{ hotel: { hotelId, name, cityCode }, offers: [{ id, price, room, policies }] }`

### Hotel Offer Detail
- **GET** `/v3/shopping/hotel-offers/{offerId}`
- **Response**: Detailed room info, pricing, cancellation policies

### Hotel Booking v1
- **POST** `/v1/booking/hotel-bookings`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "data": {
    "offerId": "{hotelOfferId}",
    "guests": [{
      "id": 1,
      "name": { "title": "MR", "firstName": "BOB", "lastName": "SMITH" },
      "contact": { "phone": "+33679278416", "email": "bob.smith@email.com" }
    }],
    "payments": [{
      "id": 1,
      "method": "creditCard",
      "card": { "vendorCode": "VI", "cardNumber": "4111111111111111", "expiryDate": "2026-08" }
    }],
    "rooms": [{ "guestIds": [1], "paymentId": 1, "specialRequest": "I will arrive at midnight" }]
  }
}
```

### Hotel Booking v2 (Preferred)
- **POST** `/v2/booking/hotel-orders`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "data": {
    "type": "hotel-order",
    "guests": [{
      "tid": 1, "title": "MR", "firstName": "BOB", "lastName": "SMITH",
      "phone": "+33679278416", "email": "bob.smith@email.com"
    }],
    "travelAgent": { "contact": { "email": "bob.smith@email.com" } },
    "roomAssociations": [{
      "guestReferences": [{ "guestReference": "1" }],
      "hotelOfferId": "{hotelOfferId}"
    }],
    "payment": {
      "method": "CREDIT_CARD",
      "paymentCard": {
        "paymentCardInfo": {
          "vendorCode": "VI", "cardNumber": "4151289722471370",
          "expiryDate": "2026-08", "holderName": "BOB SMITH"
        }
      }
    }
  }
}
```

### Hotel Ratings (Sentiment Analysis)
- **GET** `/v2/e-reputation/hotel-sentiments`
- **Params**: `hotelIds` (required): comma-separated hotel IDs

### Hotel Name Autocomplete
- **GET** `/v1/reference-data/locations/hotel`
- **Params**:
  - `keyword` (required): search text, e.g. `PARI`
  - `subType` (required): `HOTEL_LEISURE`

### Notes on Hotel API
- **No images**: Amadeus hotel endpoints do NOT return image URLs
- **Test environment**: Indian hotel availability is sparse; international cities (NYC, LON) have better test data
- **Two-step search**: Must first get hotelIds (by-city), then query offers separately

---

## Destination Experiences

### Tours and Activities (by location)
- **GET** `/v1/shopping/activities`
- **Params**: `latitude`, `longitude`, `radius` (optional)

### Tours and Activities (by ID)
- **GET** `/v1/shopping/activities/{activityId}`

### Tours and Activities (by square)
- **GET** `/v1/shopping/activities/by-square`
- **Params**: `north`, `west`, `south`, `east`

### City Search
- **GET** `/v1/reference-data/locations/cities`
- **Params**: `countryCode`, `keyword`, `max` (optional), `include` (optional, e.g. `AIRPORTS`)

---

## Car & Transfers

### Transfer Search
- **POST** `/v1/shopping/transfer-offers`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "startLocationCode": "CDG",
  "endAddressLine": "Avenue Anatole France, 5",
  "endCityName": "Paris",
  "endZipCode": "75007",
  "endCountryCode": "FR",
  "endName": "Souvenirs De La Tour",
  "endGeoCode": "48.859466,2.2976965",
  "transferType": "PRIVATE",
  "startDateTime": "2026-03-15T10:00:00",
  "passengers": 2,
  "stopOvers": [{
    "duration": "PT2H30M",
    "sequenceNumber": 1,
    "addressLine": "Avenue de la Bourdonnais, 19",
    "countryCode": "FR",
    "cityName": "Paris",
    "zipCode": "75007",
    "name": "De La Tours",
    "geoCode": "48.859477,2.2976985"
  }],
  "startConnectedSegment": {
    "transportationType": "FLIGHT",
    "transportationNumber": "AF380",
    "departure": { "localDateTime": "2026-03-15T09:00:00", "iataCode": "NCE" },
    "arrival": { "localDateTime": "2026-03-15T10:00:00", "iataCode": "CDG" }
  },
  "passengerCharacteristics": [
    { "passengerTypeCode": "ADT", "age": 20 },
    { "passengerTypeCode": "CHD", "age": 10 }
  ]
}
```

### Transfer Booking
- **POST** `/v1/ordering/transfer-orders?offerId={transferOfferId}`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "data": {
    "note": "Note to driver",
    "passengers": [{
      "firstName": "John", "lastName": "Doe", "title": "MR",
      "contacts": { "phoneNumber": "+33123456789", "email": "user@email.com" },
      "billingAddress": { "line": "Avenue de la Bourdonnais, 19", "zip": "75007", "countryCode": "FR", "cityName": "Paris" }
    }],
    "agency": { "contacts": [{ "email": { "address": "abc@test.com" } }] },
    "payment": {
      "methodOfPayment": "CREDIT_CARD",
      "creditCard": { "number": "4111111111111111", "holderName": "JOHN DOE", "vendorCode": "VI", "expiryDate": "0928", "cvv": "111" }
    }
  }
}
```

### Transfer Cancellation
- **POST** `/v1/ordering/transfer-orders/{transferOrderId}/transfers/cancellation?confirmNbr={confirmNbr}`

---

## Market Insights

### Flight Most Traveled Destinations
- **GET** `/v1/travel/analytics/air-traffic/traveled`
- **Params**: `originCityCode`, `period` (YYYY-MM), `sort` (optional), `max` (optional)

### Flight Most Booked Destinations
- **GET** `/v1/travel/analytics/air-traffic/booked`
- **Params**: `originCityCode`, `period` (YYYY-MM)

### Flight Busiest Traveling Period
- **GET** `/v1/travel/analytics/air-traffic/busiest-period`
- **Params**: `cityCode`, `period` (YYYY), `direction` (`ARRIVING` or `DEPARTING`)

---

## Itinerary Management

### Trip Purpose Prediction
- **GET** `/v1/travel/predictions/trip-purpose`
- **Params**: `originLocationCode`, `destinationLocationCode`, `departureDate`, `returnDate`

---

## Common Patterns

### Headers for POST-as-GET requests
Many search/pricing endpoints use POST with `X-HTTP-Method-Override: GET` to allow complex query bodies.

### Variable Chain (Booking Flows)
- **Flights**: Search → `flightOfferData` → Price → `flightOfferPriceData` → Book
- **Hotels**: Search by city → `hotelIds` → Hotel offers → `hotelOfferId` → Book
- **Transfers**: Search → `transferOfferId` → Book → `transferOrderId` + `transferConfirmNbr`

### Environment
- Test: `https://test.api.amadeus.com`
- Credentials in `.env`: `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`
