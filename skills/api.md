# API Skill — Backend Integration Rules

> **Security note:** Auth flows, token storage, CSRF, and PII rules are covered in [`security.md`](./security.md). Read that before touching anything in this file that deals with authentication or sensitive data.

## Purpose
This skill defines how Claude Code should handle all API communication. Every API call in the project follows these patterns.

## HTTP Client

**Use native `fetch`.** Do NOT use Axios (security risk — supply chain compromise). The API client is a thin wrapper around fetch in `/lib/api.ts`.

### API Client Pattern (`/lib/api.ts`)

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  return response.json();
}
```

### Error Handling
- Define a typed `ApiError` class with status code and message.
- All API functions must return typed promises — no `any`.
- Handle network errors (fetch throws on network failure).
- Handle timeout with `AbortController` for long-running requests.

### Authentication
- Store auth token in memory (not localStorage for sensitive tokens).
- Attach token via `Authorization: Bearer <token>` header.
- Handle 401 responses by redirecting to login or refreshing the token.

### API Function Pattern
Every endpoint gets its own typed function:

```typescript
export async function getItems(params: GetItemsParams): Promise<PaginatedResponse<Item>> {
  const query = new URLSearchParams(params as Record<string, string>);
  return apiClient<PaginatedResponse<Item>>(`/items?${query}`);
}
```

### React Query Integration
- All data fetching in components uses React Query hooks.
- Define query keys consistently: `['items', params]`.
- Configure stale time and cache time per query type.
- Use `useMutation` for POST/PUT/DELETE operations.

### Retry and Timeout
- Use `AbortController` for request timeouts:

```typescript
async function apiClient<T>(endpoint: string, options?: RequestInit & { timeout?: number }): Promise<T> {
  const controller = new AbortController();
  const timeout = options?.timeout ?? 30000;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) throw new ApiError(response.status, 'Request failed');
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}
```

- React Query handles retries automatically (3 retries by default with exponential backoff).
- For mutations, disable retries: `useMutation({ retry: false })`.

### Rate Limiting
- If the API returns 429 (Too Many Requests), respect the `Retry-After` header.
- Queue requests if hitting rate limits. Do not spam retry.
- Log rate limit events for debugging.

### Environment Variables
- Base URL: `VITE_API_BASE_URL`
- All env vars go in `.env.local` (never committed).
- `.env.example` contains all required vars with placeholder values.

<!-- ==========================================================
     PROJECT-SPECIFIC SECTION: Fill this when starting a new project
     ========================================================== -->

## Project Endpoints

**Base URL:** [API_BASE_URL]
**Auth Type:** [AUTH_TYPE — e.g., Bearer token, API key, none]

| Method | Path | Description | Request Params | Response Type |
|--------|------|-------------|---------------|---------------|
| GET    | /api/[endpoint] | [Description] | [Params] | `[ResponseType]` |

<!-- ==========================================================
     END OF PROJECT-SPECIFIC SECTION
     ========================================================== -->
