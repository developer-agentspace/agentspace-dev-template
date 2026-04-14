/**
 * API client — single source of truth for all HTTP calls.
 *
 * Components never call fetch directly. They call functions exported from
 * this file, which go through apiClient(). React Query wraps the call on
 * the component side.
 *
 * See skills/api.md for the full conventions and skills/security.md for
 * auth and PII rules.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Copy .env.example to .env.local and fill it in. ' +
      'See docs/environments.md for the full setup.',
  );
}

const DEFAULT_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getAuthHeaders(): Record<string, string> {
  // [FILL_PER_PROJECT] — implement token retrieval.
  // See skills/security.md for token storage rules (never localStorage).
  return {};
}

/**
 * Central fetch wrapper. All API calls go through this function.
 *
 * - Validates BASE_URL at module load (fails fast if missing).
 * - Sets Content-Type: application/json only when the body is present and
 *   is NOT FormData (FormData sets its own boundary header).
 * - Adds an AbortController timeout (default 30s) so requests don't hang
 *   indefinitely.
 * - Parses non-ok responses as ApiError with status + message.
 *
 * Note on type safety: the return type T is an assertion, not a runtime
 * check. The caller is responsible for validating the shape of the
 * response if it's coming from an untrusted source. Use Zod or a similar
 * runtime validator for external APIs.
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  };

  // Only set Content-Type for JSON bodies. FormData, Blob, and other body
  // types set their own headers. GET requests have no body.
  const hasJsonBody =
    options?.body !== undefined &&
    options?.body !== null &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof Blob) &&
    !(options.body instanceof ArrayBuffer) &&
    !(options.body instanceof URLSearchParams);

  if (hasJsonBody) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string> | undefined),
    },
    signal: options?.signal ?? controller.signal,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        (errorBody as Record<string, unknown>).message as string ?? `Request failed with status ${response.status}`,
      );
    }

    // 204 No Content — return empty object as T
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// Convenience helpers — add project-specific API functions below.
// Each function is a thin wrapper around apiClient that provides the endpoint,
// method, and typed response. Components call these, not apiClient directly.
// ============================================================================

// Example:
// export async function getItems(): Promise<Item[]> {
//   return apiClient<Item[]>('/items');
// }
//
// export async function createItem(body: CreateItemPayload): Promise<Item> {
//   return apiClient<Item>('/items', {
//     method: 'POST',
//     body: JSON.stringify(body),
//   });
// }
