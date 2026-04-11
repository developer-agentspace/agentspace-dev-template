/**
 * Thin wrapper around Sentry capture functions.
 *
 * Components and modules import from this file instead of from `@sentry/react`
 * directly. That way, if we ever switch providers, the swap is one file.
 *
 * Until ticket #32 (Sentry) is fully wired up — the SDK is installed and
 * `initSentry()` is called from main.tsx — these functions are no-ops. The
 * structured logger at `frontend/src/lib/logger.ts` is the primary way to
 * surface errors; this module is here for the rare case when you want to
 * report a non-Error signal to monitoring without going through the logger
 * (e.g. a metric, a custom message).
 *
 * Most code should NOT call these directly. Use `logger.error(msg, err)` and
 * configure the logger transport (see skills/observability.md) so every
 * `logger.error` flows to Sentry automatically.
 *
 * See:
 *   - skills/observability.md for the full Sentry guide
 *   - frontend/src/lib/logger.ts for the primary error-reporting path
 *   - frontend/sentry.client.config.ts for the Sentry init template
 */

// import * as Sentry from '@sentry/react';

export type MonitoringLevel = 'info' | 'warning' | 'error';

/**
 * Structured fields attached to a monitoring entry. Mirrors `LogContext`
 * from `frontend/src/lib/logger.ts` (created in ticket #38) so the same
 * shape works in both modules. Defined locally here so this file doesn't
 * depend on the logger module — the logger PR may merge before or after
 * this one.
 *
 * NEVER include PII (emails, names, phone numbers, tokens). See
 * skills/security.md for the full PII rules.
 */
export interface MonitoringContext {
  userId?: string;
  feature?: string;
  action?: string;
  traceId?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

/**
 * Capture an exception with optional structured context. No-op until the
 * Sentry SDK is installed and the lines below are uncommented.
 */
export function captureException(_error: Error, _context?: MonitoringContext): void {
  // Sentry.captureException(_error, { extra: _context });
}

/**
 * Capture a message (no Error object) with optional structured context.
 * No-op until Sentry is wired up.
 */
export function captureMessage(
  _message: string,
  _level: MonitoringLevel = 'info',
  _context?: MonitoringContext,
): void {
  // Sentry.captureMessage(_message, { level: _level, extra: _context });
}
