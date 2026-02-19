# Icon Fly - Layered Architecture

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│  UI LAYER                                           │
│  Components (Server & Client)                       │
│  src/components/{domain}/                           │
│  src/app/{domain}/page.tsx                          │
└──────────────┬──────────────────────────────────────┘
               │ Server Components call actions directly
               │ Client Components use custom hooks
               ▼
┌─────────────────────────────────────────────────────┐
│  HOOK LAYER (Client-side only)                      │
│  src/hooks/use{Domain}{Action}.ts                   │
│  Wraps fetch to API routes, manages loading/error   │
└──────────────┬──────────────────────────────────────┘
               │ Calls API routes via fetch
               ▼
┌─────────────────────────────────────────────────────┐
│  ACTION / ROUTE LAYER                               │
│  src/app/actions/{domain}Actions.ts (Server Actions) │
│  src/app/api/{domain}/{action}/route.ts (API Routes) │
│  Orchestrates: validate → service → map → respond   │
└──────────────┬──────────────────────────────────────┘
               │ Calls service methods
               ▼
┌─────────────────────────────────────────────────────┐
│  SERVICE LAYER                                      │
│  src/services/{domain}Service.ts                    │
│  Delegates HTTP to AmadeusHttpClient, returns raw   │
└──────────────┬──────────────────────────────────────┘
               │ Uses AmadeusHttpClient for all requests
               ▼
┌─────────────────────────────────────────────────────┐
│  HTTP CLIENT LAYER (Builder Pattern)                │
│  src/lib/amadeus/httpClient.ts (Singleton)          │
│  Builds URLs, injects auth, handles errors          │
│  get<T>(path, params), post<T>(path, body, headers) │
└──────────────┬──────────────────────────────────────┘
               │ Uses AuthService for tokens
               ▼
┌─────────────────────────────────────────────────────┐
│  AUTH LAYER                                         │
│  src/services/authService.ts (Singleton)            │
│  Token caching, expiry check, request deduplication │
└─────────────────────────────────────────────────────┘

Parallel layer (called by Actions/Routes after service returns):

┌─────────────────────────────────────────────────────┐
│  MAPPER LAYER                                       │
│  src/lib/mappers/{domain}Mapper.ts                  │
│  Converts API DTOs → Domain models                  │
└─────────────────────────────────────────────────────┘

Shared across all layers:

┌─────────────────────────────────────────────────────┐
│  TYPE LAYER                                         │
│  src/types/{domain}.d.ts — Domain interfaces        │
│  src/models/responses/{Domain}Response.ts — API DTOs │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  STATE LAYER (Client-side only)                     │
│  src/store/use{Domain}Store.ts                      │
│  Zustand + persist: filters, preferences, history   │
└─────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### UI Layer — Components
- **Does**: Render UI, handle user interactions, read from stores
- **Doesn't**: Fetch data directly, hold business logic, call services

### Hook Layer — Custom Hooks
- **Does**: Call API routes via fetch, manage loading/error/data state, return typed results
- **Doesn't**: Map data (that's the action/route layer), access services directly

### Action/Route Layer — Server Actions & API Routes
- **Does**: Validate input (Zod), call service, call mapper, return structured response
- **Doesn't**: Handle HTTP details (that's the service), render UI

**When to use which:**
- **Server Actions** (`useActionState`): Form submissions, mutations, server-side rendering flows
- **API Routes**: Client-side fetches from hooks, external webhook endpoints

### Service Layer — Services
- **Does**: Call `amadeusClient.get()` / `.post()` with path and params, return raw API response
- **Doesn't**: Build URLs manually, call `fetch()` directly, map data, validate input

**Service contract:**
```typescript
import amadeusClient from '@/lib/amadeus/httpClient';

class {Domain}Service {
  private static instance: {Domain}Service;
  private constructor() {}

  public static getInstance(): {Domain}Service {
    if (!{Domain}Service.instance) {
      {Domain}Service.instance = new {Domain}Service();
    }
    return {Domain}Service.instance;
  }

  public async search{Domain}(params: SearchParams): Promise<{Domain}ApiResponse> {
    try {
      return await amadeusClient.get<{Domain}ApiResponse>(
        '/v1/{domain}/endpoint',
        { key: params.value }
      );
    } catch (error) {
      console.error('{Domain}Service:', error);
      throw error;
    }
  }
}

export default {Domain}Service.getInstance();
```

### HTTP Client Layer — AmadeusHttpClient
- **Does**: Build full URLs from path + params, inject Bearer token via AuthService, throw on non-OK responses
- **Doesn't**: Know about domain logic, map responses, handle retries (future enhancement)
- Singleton at `src/lib/amadeus/httpClient.ts`, imported as `amadeusClient`
- Exposes: `get<T>(path, params?)`, `post<T>(path, body, headers?)`, `buildUrl(path, params?)`

### Auth Layer — AuthService
- Singleton with token caching and expiry
- Request deduplication (concurrent calls share one token fetch)
- Called by `AmadeusHttpClient` — services never call `AuthService` directly

### Mapper Layer — Mappers
- **Does**: Convert API DTO → domain model, handle null/missing fields gracefully
- **Doesn't**: Fetch data, throw errors for missing optional fields

**Mapper contract:**
```typescript
// src/lib/mappers/{domain}Mapper.ts
import type { {Domain}ApiResponse } from '@/models/responses/{Domain}Response';
import type { {Domain} } from '@/types/{domain}';

export function map{Domain}Response(response: {Domain}ApiResponse): {Domain}[] {
  if (!response?.data) return [];
  return response.data.map(item => ({
    // Map API fields → domain fields
  }));
}
```

### Type Layer — Types & Models
- `src/types/{domain}.d.ts` — Clean domain interfaces (what the UI works with)
- `src/models/responses/{Domain}Response.ts` — API response shapes (what the API returns)
- These are separate: domain types are stable, API types change with API versions

### State Layer — Zustand Stores
- One store per domain
- Only stores **user preferences and filters** — NOT loading/error/data state
- Uses `persist` middleware with `{domain}-store` key
- Granular selectors: `useStore(s => s.field)` not `useStore()`

**Store contract:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type {Domain}StoreState = {
  filters: {Domain}Filters;
  // preferences, history — persistent user state only
  setFilters: (filters: {Domain}Filters) => void;
};

export const use{Domain}Store = create<{Domain}StoreState>()(
  persist(
    (set) => ({
      filters: default{Domain}Filters,
      setFilters: (filters) => set({ filters }),
    }),
    { name: '{domain}-store' }
  )
);
```

---

## Error Flow

```
Service throws Error("Flight search failed: 400 Bad Request - ...")
  ↓
Action/Route catches → returns { error: "descriptive message", data: null }
  ↓
Hook receives → sets error state → component renders error UI
  ↓
OR Server Action → useActionState → component reads state.error
```

- Services always throw (never return null/empty on failure)
- Actions/routes always catch and return structured error
- Components never try/catch — they read error from state

---

## Current Implementation Status

| Domain | Service | HttpClient | Mapper | Types | Store | Hook | API Route | Action | Page |
|--------|---------|------------|--------|-------|-------|------|-----------|--------|------|
| Auth | authService.ts | N/A | N/A | AuthResponse.ts | N/A | N/A | N/A | N/A | N/A |
| Flights | flightService.ts | Yes | flightMapper.ts | flight.d.ts | useFlightStore.ts | useFlightPrice.ts | flights/search, flights/price | flightActions.ts | flights/page.tsx |
| Hotels | hotelService.ts | Yes | hotelMapper.ts | hotel.d.ts | useHotelStore.ts | useHotelSearch.ts | hotels/search | N/A | hotels/page.tsx |
| Locations | locationService.ts | Yes | locationMapper.ts | LocationSearchResponse.ts | N/A | useLocationSearch.ts | locations/search | N/A | N/A |
| Cabs | N/A (mock) | N/A | N/A | cab.d.ts | N/A | N/A | N/A | N/A | cabs/page.tsx |
| Transfers | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

**Not yet implemented:**
- Cabs: Uses mock data only — needs service + mapper + API route when Amadeus Transfer API is integrated
- Transfers: Entirely missing — scaffold with `/new-service transfer`
