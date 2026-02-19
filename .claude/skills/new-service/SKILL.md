---
name: new-service
description: Scaffold a new backend service following the project's layered architecture. Use when adding a new API domain (e.g., hotels, transfers, activities).
argument-hint: [domain-name]
disable-model-invocation: true
---

# Scaffold New Service: $ARGUMENTS

Before writing any code, read these files to understand the project architecture and coding standards:
- `.claude/CLAUDE.md` — Coding standards and SOLID rules
- `.claude/architecture.md` — Layered architecture, contracts, and data flow

If the user mentions "use API" or "use Amadeus API", also read:
- `.claude/api_usage.md` — Amadeus API endpoint details

## Files to Create

Generate all of the following files for the **$ARGUMENTS** domain. Follow the exact patterns from the architecture doc.

### 1. Type Definitions — `src/types/$ARGUMENTS.d.ts`

Define clean **domain interfaces** (what the UI works with). These are NOT API shapes.

```typescript
export interface {Domain} {
  id: string;
  // ... domain-specific fields
}

export interface {Domain}SearchParams {
  // ... search parameters
}

export interface {Domain}Filters {
  // ... filter options for the store
}
```

### 2. API Response Models — `src/models/responses/{Domain}Response.ts`

Define types matching the **raw Amadeus API response** shapes. Check `.claude/api_usage.md` for the exact response structure if integrating with Amadeus.

```typescript
export interface {Domain}ApiResponse {
  data: {Domain}ApiItem[];
  // ... match the actual API response
}
```

### 3. Service — `src/services/{domain}Service.ts`

Singleton service that handles HTTP only. Returns raw API response types. Uses AuthService for tokens.

Follow this exact pattern (from `src/services/flightService.ts`):
- Private static instance + private constructor + getInstance()
- Methods call `AuthService.getToken()` for auth
- Build URL from `process.env.AMADEUS_BASE_URL`
- Return raw API response type (NOT mapped domain model)
- Throw descriptive errors on failure
- Export default instance: `export default {Domain}Service.getInstance()`

### 4. Mapper — `src/lib/mappers/{domain}Mapper.ts`

Converts raw API response → domain model array. Handles null/missing fields gracefully.

```typescript
import type { {Domain}ApiResponse } from '@/models/responses/{Domain}Response';
import type { {Domain} } from '@/types/$ARGUMENTS';

export function map{Domain}Response(response: {Domain}ApiResponse): {Domain}[] {
  if (!response?.data) return [];
  return response.data.map(item => ({
    // Map API fields → domain fields
  }));
}
```

### 5. API Route — `src/app/api/$ARGUMENTS/search/route.ts`

Next.js API route that orchestrates: validate → service → map → respond.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {domain}Service from '@/services/{domain}Service';
import { map{Domain}Response } from '@/lib/mappers/{domain}Mapper';

export async function POST(request: NextRequest) {
  try {
    const params = await request.json();
    const rawResponse = await {domain}Service.search(params);
    const mapped = map{Domain}Response(rawResponse);
    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error('{Domain}Service:', error);
    return NextResponse.json(
      { error: { code: 'SEARCH_FAILED', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    );
  }
}
```

### 6. Server Action — `src/app/actions/{domain}Actions.ts`

Server action for form-based flows (used with `useActionState`).

```typescript
'use server';

import {domain}Service from '@/services/{domain}Service';
import { map{Domain}Response } from '@/lib/mappers/{domain}Mapper';

export type {Domain}SearchState = {
  data: {Domain}[] | null;
  error: string | null;
};

export async function search{Domain}Action(
  previousState: {Domain}SearchState,
  formData: FormData
): Promise<{Domain}SearchState> {
  try {
    // Extract and validate params from formData
    const rawResponse = await {domain}Service.search(params);
    const mapped = map{Domain}Response(rawResponse);
    return { data: mapped, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Search failed' };
  }
}
```

## After Scaffolding

1. Fill in the domain-specific fields in types and response models
2. Implement the service methods using the correct Amadeus endpoints from `api_usage.md`
3. Adjust the mapper to handle the actual API response shape
4. Update the implementation status table in `.claude/architecture.md`
