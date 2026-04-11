# Observability Skill — Errors, Logs, and Performance

## Purpose
This skill defines how every Agent Space project handles observability: error tracking, structured logging, performance monitoring, and release tracking. The goal is *production bugs surface within minutes, not via customer complaints, with enough context to fix them in the next deploy.*

The three pillars covered here are:

1. **Error tracking** — Sentry (this skill)
2. **Structured logging** — see `docs/logging.md` and `frontend/src/lib/logger.ts`
3. **Performance monitoring** — Sentry performance + Lighthouse CI (covered in `skills/performance.md` when ticket #36 lands)

## Why Sentry

We picked Sentry because:

- It's the de facto standard for SPA error tracking, so the team's prior experience transfers
- Free tier is generous enough to evaluate any new project
- React SDK auto-captures unhandled errors, breadcrumbs, and component stack traces with no per-component instrumentation
- Performance monitoring is in the same product, so we don't run two services
- Source map upload is well-supported for Vite, so production stack traces are readable

If a future project requires self-hosted observability, the integration shape (init in `main.tsx`, swappable transport in the logger) makes it possible to swap providers without changing call sites. The logger and analytics modules already follow this pattern.

## Setup overview

The template ships with **scaffolding** for Sentry but **no DSN**. Each project that adopts the template fills in their DSN in env vars and the integration activates automatically.

Files involved:

- `frontend/sentry.client.config.ts` — client-side init (this skill ships it as a placeholder)
- `frontend/src/lib/monitoring.ts` — thin wrapper around `Sentry.captureException` and `Sentry.captureMessage` so call sites don't depend on the Sentry SDK directly
- `frontend/src/main.tsx` — calls `initSentry()` once at app boot, before rendering React
- `.env.example` — documents `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT`, `VITE_SENTRY_RELEASE`
- `.github/workflows/ci.yml` — has a commented-out `sentry-cli sourcemaps upload` step that projects enable when they're ready

When a project first activates Sentry:

1. Create a Sentry project at https://sentry.io and copy the DSN
2. Add `VITE_SENTRY_DSN` to the hosting provider's environment (production + staging)
3. Add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` to GitHub Actions secrets (for source map upload)
4. Uncomment the source map upload step in `.github/workflows/ci.yml`
5. Deploy. Trigger a test error. Confirm it lands in the Sentry dashboard.

## Initialization pattern

```ts
// frontend/sentry.client.config.ts
import * as Sentry from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    // No DSN configured (typical in local dev) — skip init.
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      return scrubPIIFromEvent(event);
    },
  });
}
```

```tsx
// frontend/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { initSentry } from '../sentry.client.config';
import './index.css';
import { App } from './App';

initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

The `initSentry` call must come **before** `createRoot`. Otherwise React's first render isn't instrumented and you'll miss the most important errors.

## Error capture

Two ways to capture errors:

1. **Automatic** — unhandled exceptions, unhandled promise rejections, React error boundary errors. You don't write any code; the Sentry SDK installs the global handlers.
2. **Explicit** — when you catch an error and want to send it. Use the `monitoring` module wrapper, not the Sentry SDK directly.

```ts
// frontend/src/lib/monitoring.ts
import * as Sentry from '@sentry/react';
import type { LogContext } from './logger';

export function captureException(error: Error, context?: LogContext): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: LogContext): void {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}
```

Why a wrapper: components don't need to import the Sentry SDK directly. If we ever switch providers, the swap is one file. Same pattern as `logger.ts` and `analytics.ts`.

### Wiring the structured logger to Sentry

The structured logger at `frontend/src/lib/logger.ts` ships with a no-op transport in production (see `docs/logging.md`). When Sentry is enabled, swap the transport so error-level logs become Sentry events and other levels become breadcrumbs:

```ts
// frontend/src/main.tsx — after initSentry()
import * as Sentry from '@sentry/react';
import { setLogTransport } from './lib/logger';

setLogTransport({
  emit(entry) {
    if (entry.level === 'error' && entry.error) {
      Sentry.captureException(entry.error, { extra: entry.context });
    } else if (entry.level === 'error') {
      Sentry.captureMessage(entry.message, { level: 'error', extra: entry.context });
    } else {
      Sentry.addBreadcrumb({
        level: entry.level === 'debug' ? 'debug' : entry.level === 'warn' ? 'warning' : 'info',
        message: entry.message,
        data: entry.context,
      });
    }
  },
});
```

This is the worked example referenced in the JSDoc on `setLogTransport`. Once it's in place, **every `logger.error(msg, err)` call in the codebase becomes a Sentry event** without changing any other code.

## React error boundary

Wrap the app's router (or the whole app) in `Sentry.ErrorBoundary`:

```tsx
import * as Sentry from '@sentry/react';

<Sentry.ErrorBoundary
  fallback={({ error, resetError }) => (
    <div role="alert" className="p-6">
      <h2 className="text-lg font-bold">Something went wrong</h2>
      <p className="mt-2 text-slate-600">We've been notified and are looking into it.</p>
      <button onClick={resetError} className="mt-4 px-4 py-2 bg-brand text-white rounded">
        Try again
      </button>
    </div>
  )}
>
  <App />
</Sentry.ErrorBoundary>
```

The fallback is shown when a render or lifecycle method throws. Sentry captures the error, the component stack, and the user's recent breadcrumbs automatically.

## Filtering noisy errors

Some errors are not bugs. Filter them in `beforeSend` so Sentry's quota isn't burned on noise:

```ts
function shouldSendEvent(event: Sentry.ErrorEvent): boolean {
  const message = event.message ?? event.exception?.values?.[0]?.value ?? '';

  // Common false positives:
  if (message.includes('ResizeObserver loop')) return false;
  if (message.includes('Non-Error promise rejection captured')) return false;
  if (message.includes('Network Error') && navigator.onLine === false) return false;

  // Browser extensions throwing into the page:
  const stack = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
  if (stack.some((frame) => frame.filename?.includes('chrome-extension://'))) return false;

  return true;
}

Sentry.init({
  ...
  beforeSend(event) {
    if (!shouldSendEvent(event)) return null;
    return scrubPIIFromEvent(event);
  },
});
```

Add to this list as new noise patterns surface. Anything filtered should be **noise**, not real errors you want to ignore.

## PII scrubbing

Sentry can capture URLs, headers, request bodies, breadcrumbs, and component props. All of these can leak PII. The `beforeSend` hook is the chokepoint where you scrub.

```ts
function scrubPIIFromEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  // Drop request body — may contain form input
  if (event.request?.data) delete event.request.data;

  // Scrub query string PII patterns from the URL
  if (event.request?.url) {
    event.request.url = event.request.url.replace(/[?&](email|token|key)=[^&]*/gi, '$1=[REDACTED]');
  }

  // Drop user.email if for any reason it ended up here
  if (event.user) {
    delete event.user.email;
    delete event.user.username;
    // Keep event.user.id — opaque IDs are safe
  }

  return event;
}
```

The full PII rules are in `skills/security.md`. The Sentry-specific reminders:

- **Never** put a user's email or full name in `Sentry.setUser({ ... })`. Use the opaque ID only.
- **Never** include free-text user input (search queries, comments, form values) in the breadcrumb data.
- **Never** include auth tokens, API keys, or session IDs in event extras.
- **Drop request bodies** by default. If you need them for debugging, scrub them per-field.

## Adding user context (without PII)

```ts
import * as Sentry from '@sentry/react';
import { logger } from './lib/logger';

// On login
Sentry.setUser({
  id: user.id, // opaque, OK
  // Do NOT add: email, name, phone, address
});
Sentry.setTag('plan', user.plan);
Sentry.setTag('tenant_id', org.id);

logger.info('user logged in', { userId: user.id, feature: 'auth' });

// On logout
Sentry.setUser(null);
```

`setUser` lets Sentry filter and group events by user. `setTag` is for searchable categorical fields. Both are stored on the session, so subsequent errors carry the same context until logout.

## Tagging errors by feature area

Use `logger.error(msg, err, { feature: 'shipping-bill-search' })` and the `feature` tag flows through to Sentry as part of the `extra` payload. To make features filterable in Sentry's UI, also call `Sentry.setTag('feature', name)` at the entry point of each feature, or wrap feature areas in `Sentry.withScope`:

```ts
Sentry.withScope((scope) => {
  scope.setTag('feature', 'shipping-bill-search');
  scope.setExtras({ filter: appliedFilters });
  // ... do the work that might throw
});
```

## Releases

When CI deploys, it should tag the Sentry release with the deploy SHA so errors after the deploy can be linked to the exact commit.

```yaml
# .github/workflows/ci.yml — commented out by default until a project enables it
# - name: Upload source maps to Sentry
#   uses: getsentry/action-release@v1
#   env:
#     SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
#     SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
#     SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
#   with:
#     environment: production
#     sourcemaps: ./frontend/dist/assets
#     version: ${{ github.sha }}
```

Releases also let Sentry compute regression detection — *"this error first appeared in v1.2.3"* — which is invaluable for postmortems.

## Local development

In local dev, **Sentry is disabled** by default because `VITE_SENTRY_DSN` is unset in `.env.example`. The `initSentry()` function early-returns if there's no DSN. This is intentional — you don't want every dev mistake firing into the production Sentry project.

If you do need Sentry locally (e.g., to test the integration), set `VITE_SENTRY_DSN` in your `.env.local` and use a separate Sentry project for development.

## What Sentry is and isn't for

**Use Sentry for:**

- Catching unexpected runtime errors that users see
- Capturing unhandled promise rejections
- Tracking performance regressions (LCP, INP, slow API calls)
- Linking errors to releases for postmortem analysis
- Session replay on errors (with masking, see init config above)

**Don't use Sentry for:**

- Application logging — use `logger.info` / `logger.warn`. Sentry is for errors and signals.
- Analytics — use the analytics module. Sentry is not a product analytics tool.
- Performance monitoring of every page load — sample at 10% in production (set in `tracesSampleRate`)
- Storing PII for debugging — never. Use opaque IDs and look up the rest in your admin tool.
- Replacing structured logs — Sentry breadcrumbs are a small ring buffer (default 100 items). Don't rely on them for full audit history.

## Cross-references

- `docs/logging.md` — structured logging policy and the logger module
- `frontend/src/lib/logger.ts` — the logger; pair with the Sentry transport above
- `frontend/src/lib/monitoring.ts` — thin wrapper around Sentry capture functions
- `frontend/sentry.client.config.ts` — the init function template
- `skills/security.md` — full PII rules
- `skills/performance.md` — Sentry performance monitoring (when ticket #36 lands)
- Sentry React docs — https://docs.sentry.io/platforms/javascript/guides/react/
- Sentry source maps — https://docs.sentry.io/platforms/javascript/sourcemaps/
