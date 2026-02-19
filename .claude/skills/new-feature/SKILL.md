---
name: new-feature
description: Scaffold a complete user-facing feature with page, components, store, and hook. Use when building a new frontend feature (e.g., cab booking, activity search).
argument-hint: [feature-name]
disable-model-invocation: true
---

# Scaffold New Feature: $ARGUMENTS

Before writing any code, read these files:
- `.claude/CLAUDE.md` — Coding standards and SOLID rules
- `.claude/architecture.md` — Layered architecture and component rules

## Prerequisites

Ensure the backend service layer exists for this domain. If not, tell the user to run `/new-service $ARGUMENTS` first.

## Files to Create

### 1. Zustand Store — `src/store/use{Domain}Store.ts`

Client-side persistent store for **user preferences and filters only** (NOT loading/error state).

Follow the pattern from `src/store/useFlightStore.ts`:
- Use `create` from `zustand` with `persist` middleware
- Export types for filters and preferences
- Export default filter/preference constants
- Granular setters (one per field)
- Storage key: `{domain}-store`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { {Domain}Filters } from '@/types/$ARGUMENTS';

export const default{Domain}Filters: {Domain}Filters = {
  // sensible defaults
};

type {Domain}StoreState = {
  filters: {Domain}Filters;
  setFilters: (filters: {Domain}Filters) => void;
  // Add search history, preferences as needed
};

export const use{Domain}Store = create<{Domain}StoreState>()(
  persist(
    (set) => ({
      filters: default{Domain}Filters,
      setFilters: (filters) => set({ filters }),
    }),
    { name: '$ARGUMENTS-store' }
  )
);
```

### 2. Custom Hook — `src/hooks/use{Domain}Search.ts`

Client-side data fetching hook. Wraps the API route call, manages loading/error/data.

```typescript
'use client';

import { useState, useCallback } from 'react';
import type { {Domain} } from '@/types/$ARGUMENTS';

type Use{Domain}SearchReturn = {
  data: {Domain}[] | null;
  loading: boolean;
  error: string | null;
  search: (params: {Domain}SearchParams) => Promise<void>;
};

export function use{Domain}Search(): Use{Domain}SearchReturn {
  const [data, setData] = useState<{Domain}[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: {Domain}SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/$ARGUMENTS/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, search };
}
```

### 3. Page — `src/app/$ARGUMENTS/page.tsx`

Server Component. Fetches initial data if needed, renders layout with components.

Follow the pattern from `src/app/hotels/page.tsx`:
- Server Component (no `"use client"`)
- Import server utilities (currency, etc.) as needed
- Responsive layout: gradient header + two-column grid (filters sidebar + main content)

```typescript
import { {Domain}SearchForm } from '@/components/$ARGUMENTS/{Domain}SearchForm';
import { {Domain}Results } from '@/components/$ARGUMENTS/{Domain}Results';
import { {Domain}Filters } from '@/components/$ARGUMENTS/{Domain}Filters';

export default async function {Domain}Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient header */}
      <div className="gradient-hero py-8 text-white text-center">
        <h1 className="text-3xl font-bold">Search {Domain}</h1>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <{Domain}Filters />
          <div className="space-y-6">
            <{Domain}SearchForm />
            <{Domain}Results />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4. Search Form Component — `src/components/$ARGUMENTS/{Domain}SearchForm.tsx`

Client Component with form inputs for the search.

```typescript
'use client';

// Use glass-card styling, lucide-react icons
// Form fields depend on domain (destination, dates, guests, etc.)
// On submit: call the custom hook's search function
// Use useActionState if using server actions instead of hooks
```

### 5. Results Component — `src/components/$ARGUMENTS/{Domain}Results.tsx`

Client Component displaying the search results.

```typescript
'use client';

// Read filters from use{Domain}Store (granular selectors)
// Filter results client-side based on store filters
// Render {Domain}Card for each result
// Show loading skeleton, empty state, error state
// Staggered animation on cards (animate-fade-in)
```

### 6. Card Component — `src/components/$ARGUMENTS/{Domain}Card.tsx`

Client Component for a single result item.

```typescript
'use client';

// Props: single {Domain} item
// Display key info: name, rating, price, image
// Use glass-card styling
// Keep under 150 lines
// lucide-react icons for visual elements
```

### 7. Filters Component — `src/components/$ARGUMENTS/{Domain}Filters.tsx`

Client Component for the filter sidebar.

```typescript
'use client';

// Read/write filters via use{Domain}Store (granular selectors)
// Collapsible on mobile (hidden by default, toggle button)
// Sticky on desktop (lg:sticky lg:top-20)
// Reset filters button
// Price range, rating, category-specific filters
```

## Design System Reference

Use these project custom utilities (defined in globals.css):
- `glass`, `glass-card`, `glass-input` — Glass morphism effects
- `gradient-hero`, `gradient-primary`, `gradient-accent` — Gradient backgrounds
- `animate-fade-in`, `animate-slide-up` — Entry animations
- Primary: Blue (#1a56db), Accent: Orange (#f97316)
- Icons: Import from `lucide-react`

## After Scaffolding

1. Customize form fields for the domain
2. Design the card layout for the domain's data
3. Add domain-specific filters
4. Connect to the backend service (ensure `/new-service` was run first)
5. Add the page to the navigation in Navbar and MobileBottomNav
