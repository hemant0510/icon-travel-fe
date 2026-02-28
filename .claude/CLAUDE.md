fi# Icon Fly - Project Instructions

## API Reference
When the user says "use API", "use Amadeus API", or references any Amadeus endpoint, always read `.claude/api_usage.md` for endpoint details (URLs, params, request bodies, auth flow). If an endpoint isn't documented there, check the source Postman collection at `Postman collection/Amadeus for Developers.postman_collection.json`.

## Architecture
Read `.claude/architecture.md` before making structural changes. It defines the layered architecture, data flow, and base contracts that all code must follow.

---

## SOLID Principles (Strict)

### Single Responsibility (SRP)
- **Services** ONLY handle HTTP communication (fetch data, return raw response). NO mapping, NO business logic inside services.
- **Mappers** (`src/lib/mappers/{domain}Mapper.ts`) convert API DTOs to domain models. One mapper file per domain.
- **Server Actions** orchestrate: validate input → call service → map response → return result.
- **Components** render UI only. Data fetching goes in custom hooks or server actions.

```
DON'T: service.searchHotels() that fetches AND maps AND filters
DO:    service.searchHotels() → returns raw API response
       mapHotelResponse(raw) → returns Hotel[]
       action orchestrates both
```

### Open/Closed (OCP)
- All services implement the base patterns defined in `architecture.md`. New services extend, never copy-paste.
- Use the existing `AuthService` singleton for token management — never create a second auth mechanism.
- Add new API domains by creating new service + mapper + types, not by modifying existing services.

### Liskov Substitution (LSP)
- All services must be swappable. A mock service returning static data must work wherever the real service is used.
- Return consistent types: services return raw API response types, mappers return domain model types.

### Interface Segregation (ISP)
- Zustand stores expose granular selectors. Components subscribe only to what they render.
- Don't put loading/error state in domain stores — use local component state or a dedicated UI store.

```
DON'T: const { filters, destination, isLoading, error, setFilters, setDestination } = useHotelStore()
DO:    const filters = useHotelStore(s => s.filters)
       const setFilters = useHotelStore(s => s.setFilters)
```

### Dependency Inversion (DIP)
- Services depend on `AmadeusHttpClient` (`src/lib/amadeus/httpClient.ts`) for all HTTP calls — never use raw `fetch` or manual URL construction.
- `AmadeusHttpClient` depends on `AuthService` for tokens — services never call `AuthService` directly.
- Components use custom hooks (`useFlightSearch`, `useLocationSearch`, `useFlightPrice`) or server actions, never direct `fetch('/api/...')` calls.
- API route strings live in one place (the hook or action), not scattered across components.

---

## Design Patterns

| Pattern | Where | Rule |
|---------|-------|------|
| **Singleton** | Services, HttpClient | Private constructor + `getInstance()` + default export instance |
| **Builder** | `src/lib/amadeus/httpClient.ts` | `AmadeusHttpClient` builds URLs, injects auth, handles errors. Services use `amadeusClient.get()` / `.post()` — never raw `fetch` |
| **Adapter/Mapper** | `src/lib/mappers/` | One file per domain. Converts API DTO → domain model |
| **Repository** | Services | Abstract data source behind service methods |
| **Custom Hooks** | `src/hooks/` | All client-side data fetching via `use{Domain}{Action}` hooks |

---

## File/Folder Conventions

```
src/
├── lib/amadeus/httpClient.ts          # AmadeusHttpClient singleton (Builder pattern)
├── services/{domain}Service.ts        # HTTP calls via httpClient (singleton)
├── lib/mappers/{domain}Mapper.ts      # API DTO → domain model
├── lib/mappers/index.ts               # Barrel re-exports for all mappers
├── types/{domain}.d.ts                # Domain interfaces
├── models/responses/{Domain}Response.ts  # API response DTOs
├── store/use{Domain}Store.ts          # Zustand store (persist middleware)
├── hooks/use{Domain}{Action}.ts       # Custom data-fetching hooks
├── app/
│   ├── api/{domain}/{action}/route.ts # API routes
│   ├── actions/{domain}Actions.ts     # Server actions
│   └── {domain}/page.tsx              # Pages (Server Components)
├── components/{domain}/               # Domain-specific components
└── components/layout/                 # Shared layout components
```

**Naming rules:**
- Files: camelCase for services/hooks/stores, PascalCase for components
- Types: PascalCase interfaces, camelCase properties
- Stores: always prefix with `use`, always use `persist` middleware

---

## Error Handling

- `AmadeusHttpClient` throws on non-OK responses with status + body: `throw new Error(\`\${status} \${statusText} - \${errorText}\`)`
- Services catch, log with service prefix, and re-throw: `console.error('FlightService:', error); throw error;`
- Server actions catch errors and return structured state: `{ error: string, data: null }`
- API routes catch errors and return structured JSON: `{ error: { code: string, message: string } }`
- Components display errors from action state or hook return values — never use `try/catch` in render
- Always use `console.error` with the class name prefix: `console.error('{ServiceName}:', error)`

---

## Component Rules

- **Server Components by default**. Only add `"use client"` when the component needs interactivity (event handlers, hooks, browser APIs).
- **Never pass functions** from Server Components to Client Components as props.
- **Props interface** defined and exported above the component function.
- **Max 150 lines** per component file. If larger, extract sub-components.
- **No inline fetch calls** in components. Use custom hooks (`src/hooks/`) or server actions (`src/app/actions/`).
- **Styling**: Use Tailwind CSS 4 utilities. Use project custom utilities (`glass`, `glass-card`, `gradient-hero`, etc.) defined in `globals.css`.

---

## Stack Reference
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Zustand for client state, Zod for validation
- Amadeus API for flights/hotels/transfers
- lucide-react for icons
