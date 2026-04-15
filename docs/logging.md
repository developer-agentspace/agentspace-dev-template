# Frontend Logging

> **Where this lives:** This document captures the logging patterns for the frontend template. When ticket #32 (Sentry / `skills/observability.md`) lands, the contents here should fold into `skills/observability.md` as the "Logging" section. Until then, this is the canonical reference.

## Why a logger and not `console.log`

Scattered `console.log` calls have three problems:

1. **They're not searchable in production.** Console output disappears the moment the user closes the tab. Production debugging requires a log aggregator, which means structured entries with consistent fields.
2. **They leak.** A `console.log({ user, token })` in dev ships to prod and exposes secrets in the user's devtools or in screen-recordings shared in support tickets.
3. **They have no level discipline.** Everything is the same colour. There's no way to filter "show me only errors" without `Ctrl+F`-ing through the noise.

The logger fixes all three. Use it instead of `console.*`. ESLint will block direct `console.*` calls everywhere except inside `src/lib/logger.ts` itself.

## The API

```ts
import { logger } from './lib/logger';

logger.debug('verbose detail', { traceId });             // stripped in prod
logger.info('user submitted form', { feature, action });  // notable but expected
logger.warn('retrying after 5xx', { statusCode: 503 });   // unexpected, recoverable
logger.error('checkout failed', err, { feature, userId }); // needs investigation
```

Every method takes an optional **structured context** object typed as `LogContext`. The transport is responsible for serializing it (the dev console transport pretty-prints, the production Sentry transport will JSON-stringify into a breadcrumb).

## Levels — when to use each

| Level | Use it for | Don't use it for |
|---|---|---|
| `debug` | Verbose flow tracing while developing a feature | Anything you want to see in production — `debug` is stripped at runtime when `import.meta.env.MODE === 'production'` |
| `info` | User actions, completed flows, navigation events, external API calls | High-frequency events (mouse moves, scroll, every keystroke) — those drown out signal |
| `warn` | Retries, fallbacks, degraded behavior, unexpected-but-handled conditions | Things that are actually fine — don't cry wolf |
| `error` | Caught exceptions, failed assertions, anything you'd want a Sentry alert for | Validation errors that are user input mistakes (those are `info` at most) |

## When to log

**Yes:**

- A user clicks a destructive action (delete, refund, send) — log `info` with the action name and an opaque user ID
- An API call returns 4xx or 5xx — log `warn` (4xx) or `error` (5xx) with the endpoint and status
- A code path catches an exception — log `error` with the original Error object so the stack trace makes it to Sentry
- A feature flag is checked and the result alters a flow — log `debug` with the flag name (helps trace which branch ran)
- A long-running operation finishes — log `info` with `durationMs`

**No:**

- Inside a tight loop or render path — logs in render functions will fire on every re-render and overwhelm the transport
- For routine reads (`GET /api/items` returning 200) — there's no signal here
- For data the user can already see on the page (the contents of a chart they're looking at)
- For *every* state change — pick the load-bearing transitions, not all of them

## What NOT to put in `LogContext`

The logger does **not** redact for you. You are responsible for not passing dangerous data into the context object.

**Never log:**

- Email addresses, full names, phone numbers, physical addresses
- Auth tokens, API keys, session IDs, refresh tokens
- Passwords (obvious but worth saying)
- Full request bodies for write endpoints (may contain credentials)
- Free-text user input that could contain PII

**Use opaque IDs instead:**

```ts
// BAD
logger.info('user logged in', { email: user.email, name: user.fullName });

// GOOD
logger.info('user logged in', { userId: user.id });
```

If you need to debug a specific user's session, look up their record by ID in the admin tool. Logs are for patterns, not individuals.

## Adding context

The `LogContext` type has a few well-known fields (`userId`, `feature`, `action`, `traceId`, `statusCode`, `durationMs`) and accepts arbitrary additional fields via the `[key: string]: unknown` index signature. **Prefer the well-known fields** when they fit — they make logs searchable across features.

For new fields that are likely to recur, add them to the `LogContext` interface in `src/lib/logger.ts` so the type guides the next caller.

## Good vs bad logs

```ts
// BAD: unstructured, leaks PII, no context
console.log('User ' + user.email + ' clicked submit on ' + Date.now());

// GOOD: structured, opaque ID, well-known fields
logger.info('form submitted', {
  userId: user.id,
  feature: 'shipping-bill-search',
  action: 'submit-search-form',
});
```

```ts
// BAD: error object discarded, no stack trace makes it to Sentry
catch (e) {
  console.log('something failed: ' + e);
}

// GOOD: full Error preserved, context attached
catch (err) {
  logger.error('shipping bill fetch failed', err as Error, {
    feature: 'shipping-bill-list',
    statusCode: 500,
  });
}
```

```ts
// BAD: high-frequency, will overwhelm the transport
useEffect(() => {
  logger.debug('component re-rendered', { props });
});

// GOOD: log the load-bearing transition only
useEffect(() => {
  logger.debug('shipping bill list loaded', { count: bills.length });
}, [bills.length]);
```

## How logs flow

**Development** (`import.meta.env.MODE !== 'production'`):

```
logger.info(...) → consoleTransport → console.info(prefix, msg, ctx)
```

You see colour-coded entries in the browser devtools console with the timestamp, level, and inlined context object.

**Production** (`import.meta.env.MODE === 'production'`):

```
logger.info(...) → noopTransport → /dev/null   (until ticket #32 lands)
logger.error(...) → noopTransport → /dev/null
```

This is intentional. Until Sentry is wired up (ticket #32), logging in production is a no-op so the bundle stays clean and there's no risk of accidentally leaking. Once Sentry is initialised in `main.tsx`, the host app should call `setLogTransport` with a Sentry-backed transport. The example is documented in the JSDoc for `setLogTransport` in `src/lib/logger.ts`.

After ticket #32:

```
logger.info(...)  → sentryTransport → Sentry.addBreadcrumb({ level: 'info', ... })
logger.warn(...)  → sentryTransport → Sentry.addBreadcrumb({ level: 'warning', ... })
logger.error(...) → sentryTransport → Sentry.captureException(err, { extra: ctx })
logger.debug(...) → no-op in production (stripped before reaching the transport)
```

## ESLint enforcement

The frontend ESLint config bans `console.*` everywhere except `src/lib/logger.ts` and `src/lib/logger.test.ts`. If you try to commit a `console.log`, the pre-commit hook will fail. The fix is to use `logger` instead, not to suppress the rule.

## Cross-references

- Implementation: [`../frontend/src/lib/logger.ts`](../frontend/src/lib/logger.ts)
- Tests: [`../frontend/src/lib/logger.test.ts`](../frontend/src/lib/logger.test.ts)
- ESLint config: [`../frontend/eslint.config.js`](../frontend/eslint.config.js)
- Future Sentry integration: ticket #32 (5.1)
- Future `skills/observability.md`: also from ticket #32 — when it lands, fold this document into it
