/**
 * Analytics integration — provider-agnostic.
 *
 * The template ships with a no-op implementation that just logs to the
 * structured logger. To use a real provider (Posthog, Mixpanel, Amplitude,
 * GA4), implement the `AnalyticsProvider` interface and call
 * `setAnalyticsProvider()` once at app startup, typically in `main.tsx`
 * after env vars are read.
 *
 * Why provider-agnostic: every Agent Space project may have a different
 * client preference. The interface here is the contract; the provider is
 * an implementation detail. This means we can switch providers without
 * touching call sites.
 *
 * PII safety: every event payload runs through `scrubPII()` before reaching
 * the provider. The scrubber removes a known set of forbidden field names.
 * It is NOT exhaustive — see `skills/security.md` for the full PII rules.
 * Authors are still responsible for not putting PII in events; the scrubber
 * is a backstop, not a primary defense.
 */

import type { EventName, EventProperties, IdentifyTraits } from './analytics-events';

// Re-exported so consumers can introspect the catalog at runtime if needed.
export { EVENT_METADATA, EVENT_NAMES } from './analytics-events';
export type { EventName, EventProperties, IdentifyTraits } from './analytics-events';

export interface AnalyticsProvider {
  track(event: EventName, props: EventProperties): void;
  identify(userId: string, traits?: IdentifyTraits): void;
  page(name: string, props?: EventProperties): void;
}

/**
 * No-op provider. Used until a real provider is wired up via
 * setAnalyticsProvider(). Truly does nothing in both dev and prod — there
 * are no side effects, no logging.
 *
 * If you want dev-time visibility into analytics calls without wiring a
 * real provider, install a debug provider in main.tsx that delegates to
 * the structured logger:
 *
 *   import { logger } from './lib/logger';
 *   import { setAnalyticsProvider } from './lib/analytics';
 *
 *   if (import.meta.env.MODE === 'development') {
 *     setAnalyticsProvider({
 *       track: (event, props) => logger.debug('[analytics] track', { event, ...props }),
 *       identify: (userId, traits) => logger.debug('[analytics] identify', { userId, ...traits }),
 *       page: (name, props) => logger.debug('[analytics] page', { name, ...props }),
 *     });
 *   }
 */
const noopProvider: AnalyticsProvider = {
  track() {
    // intentionally empty
  },
  identify() {
    // intentionally empty
  },
  page() {
    // intentionally empty
  },
};

let activeProvider: AnalyticsProvider = noopProvider;

/**
 * Replace the active analytics provider. Call once at app startup, typically
 * in main.tsx after reading env vars.
 *
 * @example
 * import posthog from 'posthog-js';
 * import { setAnalyticsProvider } from './lib/analytics';
 *
 * posthog.init(import.meta.env.VITE_ANALYTICS_WRITE_KEY, {
 *   api_host: 'https://app.posthog.com',
 * });
 *
 * setAnalyticsProvider({
 *   track(event, props) {
 *     posthog.capture(event, props);
 *   },
 *   identify(userId, traits) {
 *     posthog.identify(userId, traits);
 *   },
 *   page(name, props) {
 *     posthog.capture('$pageview', { page_name: name, ...props });
 *   },
 * });
 */
export function setAnalyticsProvider(provider: AnalyticsProvider): void {
  activeProvider = provider;
}

/**
 * Reset to the default no-op provider. Useful in tests.
 */
export function resetAnalyticsProvider(): void {
  activeProvider = noopProvider;
}

/**
 * PII scrubber. Removes any field whose name matches a known forbidden
 * pattern. NOT a primary defense — see skills/security.md for the full PII
 * rules. Authors must still not put PII into event payloads.
 */
const FORBIDDEN_FIELD_NAMES = new Set([
  'email',
  'emailAddress',
  'name',
  'fullName',
  'firstName',
  'lastName',
  'phone',
  'phoneNumber',
  'address',
  'streetAddress',
  'password',
  'token',
  'authToken',
  'apiKey',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
  'aadhaar',
  'pan',
]);

function scrubPII<T extends Record<string, unknown>>(obj: T | undefined): T | undefined {
  if (!obj) return obj;
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (FORBIDDEN_FIELD_NAMES.has(key)) {
      // Drop silently. Logging the drop would itself leak the value.
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned as T;
}

/**
 * Track a typed event. Use this for everything except page views and
 * identify calls.
 *
 * @example
 * track('search_performed', { feature: 'shipping-bill-search', resultCount: 42 });
 */
export function track(event: EventName, props?: EventProperties): void {
  const scrubbed = scrubPII(props) ?? {};
  // Required-prop validation lives in the unit tests (analytics.test.ts).
  // The TypeScript types in EventProperties + EVENT_METADATA are the primary
  // defense against missing fields at compile time.
  activeProvider.track(event, scrubbed);
}

/**
 * Associate the current session with a user. Call after login completes.
 *
 * @example
 * identify(user.id, { plan: 'pro', tenantId: org.id });
 */
export function identify(userId: string, traits?: IdentifyTraits): void {
  activeProvider.identify(userId, scrubPII(traits));
}

/**
 * Track a page view. Pass the logical page name from the route, NOT the URL
 * (URLs may contain query strings or path params with PII).
 *
 * @example
 * page('reports', { reportType: 'cha' });
 */
export function page(name: string, props?: EventProperties): void {
  activeProvider.page(name, scrubPII(props));
}
