/**
 * Sentry client-side initialization.
 *
 * This file is a TEMPLATE. To activate Sentry in a project:
 *
 * 1. Install the SDK:
 *      npm install --save @sentry/react
 * 2. Set VITE_SENTRY_DSN in the hosting provider's env (production + staging).
 *    Local dev: leave unset to keep Sentry disabled — see initSentry() below.
 * 3. Import and call initSentry() from main.tsx BEFORE createRoot().
 * 4. (Optional) Wire the structured logger to Sentry — see the worked
 *    example in skills/observability.md.
 *
 * The body below is intentionally inert (no Sentry SDK import) so the
 * template builds without the @sentry/react dependency. Uncomment the
 * import and the body when you adopt Sentry. The function signature
 * stays the same so call sites in main.tsx don't need to change.
 *
 * See:
 *   - skills/observability.md for the full setup, scrubbing, and tagging guide
 *   - skills/security.md for the PII rules that drive the beforeSend scrubber
 *   - frontend/src/lib/monitoring.ts for the wrapper around captureException
 */

// import * as Sentry from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    // No DSN configured — typical in local dev. Skip init silently.
    return;
  }

  // ===========================================================================
  // Uncomment after running `npm install --save @sentry/react`
  // ===========================================================================
  //
  // Sentry.init({
  //   dsn,
  //   environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
  //   release: import.meta.env.VITE_SENTRY_RELEASE,
  //
  //   integrations: [
  //     Sentry.browserTracingIntegration(),
  //     Sentry.replayIntegration({
  //       maskAllText: true,
  //       blockAllMedia: true,
  //     }),
  //   ],
  //
  //   // Sample 10% of transactions in prod, all in dev.
  //   tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  //
  //   // Replays only fire on errors. Sessions are off.
  //   replaysSessionSampleRate: 0.0,
  //   replaysOnErrorSampleRate: 1.0,
  //
  //   beforeSend(event) {
  //     return scrubPIIFromEvent(event);
  //   },
  //
  //   // Filter known noise. See skills/observability.md for the full list.
  //   ignoreErrors: [
  //     'ResizeObserver loop limit exceeded',
  //     'Non-Error promise rejection captured',
  //   ],
  // });
}

// /**
//  * PII scrubber for Sentry events. Drops request bodies, scrubs URL query
//  * strings, and removes user.email/username if present. Opaque user.id is
//  * preserved. See skills/security.md for the full PII policy.
//  */
// function scrubPIIFromEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
//   if (event.request?.data) delete event.request.data;
//
//   if (event.request?.url) {
//     event.request.url = event.request.url.replace(
//       /[?&](email|token|key|password)=[^&]*/gi,
//       '$1=[REDACTED]',
//     );
//   }
//
//   if (event.user) {
//     delete event.user.email;
//     delete event.user.username;
//   }
//
//   return event;
// }
