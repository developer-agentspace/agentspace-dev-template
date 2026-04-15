/**
 * Structured logger for the frontend.
 *
 * Goals:
 * 1. One canonical API across the app — `logger.info`, `logger.warn`,
 *    `logger.error`, `logger.debug`. No more scattered `console.log`.
 * 2. Every log is **structured** — a message string plus an optional context
 *    object with typed fields. Searchable in any log aggregator.
 * 3. Different transports for development and production:
 *    - **Development:** pretty-printed to the browser console with colours
 *      and the context object inlined for inspection.
 *    - **Production:** delegated to a `LogTransport` that the host app
 *      configures (typically pointed at Sentry breadcrumbs and Sentry
 *      `captureException` for errors). The default production transport
 *      is a no-op so the bundle stays clean if Sentry isn't wired up yet.
 * 4. `debug` is **stripped in production** — calls return immediately.
 * 5. PII and secrets must NEVER be passed in the context object. The
 *    logger does not redact for you. See `docs/logging.md` for the rules.
 *
 * Sentry integration is intentionally deferred. When ticket #32 lands and
 * Sentry is initialised in `main.tsx`, replace the default `noopTransport`
 * via `setLogTransport` with one that calls `Sentry.addBreadcrumb` for
 * info/warn/debug and `Sentry.captureException` for error.
 */

// This file is the only place direct console.* calls are allowed. The
// no-console rule is disabled for this file via a pattern override in
// `eslint.config.js`. Everywhere else in the app, use `logger`.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Structured fields attached to a log entry. Add fields here as the app
 * grows so the type guides usage. All fields are optional — pass only the
 * ones that are meaningful for the call site.
 *
 * **Never** include PII (names, emails, full addresses) or secrets (tokens,
 * passwords) in this object. Use opaque IDs instead.
 */
export interface LogContext {
  /** Opaque user identifier. Never the user's email or name. */
  userId?: string;
  /** Logical feature area, e.g. 'shipping-bill-search', 'auth'. */
  feature?: string;
  /** What the user or system was trying to do, e.g. 'submit-form'. */
  action?: string;
  /** Distributed trace ID for correlating across services. */
  traceId?: string;
  /** HTTP status code, when relevant to the log line. */
  statusCode?: number;
  /** Duration in milliseconds, when timing an operation. */
  durationMs?: number;
  /** Anything else, opaque. Will be JSON-stringified by transports. */
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** The Error object, if this is an error log. */
  error?: Error;
}

export interface LogTransport {
  emit(entry: LogEntry): void;
}

/**
 * Default production transport. No-op until ticket #32 (Sentry) lands.
 */
const noopTransport: LogTransport = {
  emit() {
    // intentionally empty
  },
};

/**
 * Default development transport. Pretty-prints to the browser console.
 * Picks the right `console` method per level so devtools filtering works.
 */
const consoleTransport: LogTransport = {
  emit(entry) {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const fn =
      entry.level === 'error'
        ? console.error
        : entry.level === 'warn'
          ? console.warn
          : entry.level === 'debug'
            ? console.debug
            : console.info;
    if (entry.error) {
      fn(prefix, entry.message, entry.context ?? {}, entry.error);
    } else if (entry.context) {
      fn(prefix, entry.message, entry.context);
    } else {
      fn(prefix, entry.message);
    }
  },
};

const isProduction = import.meta.env.MODE === 'production';
let activeTransport: LogTransport = isProduction ? noopTransport : consoleTransport;

/**
 * Replace the active log transport. Call once at app startup, typically
 * after Sentry has been initialised.
 *
 * @example
 * import * as Sentry from '@sentry/react';
 * import { logger, setLogTransport } from './lib/logger';
 *
 * Sentry.init({ ... });
 * setLogTransport({
 *   emit(entry) {
 *     if (entry.level === 'error' && entry.error) {
 *       Sentry.captureException(entry.error, { extra: entry.context });
 *     } else {
 *       Sentry.addBreadcrumb({
 *         level: entry.level === 'debug' ? 'debug' : entry.level,
 *         message: entry.message,
 *         data: entry.context,
 *       });
 *     }
 *   },
 * });
 */
export function setLogTransport(transport: LogTransport): void {
  activeTransport = transport;
}

/**
 * Reset to the default transport (console in dev, no-op in production).
 * Useful in tests.
 */
export function resetLogTransport(): void {
  activeTransport = isProduction ? noopTransport : consoleTransport;
}

function emit(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  // `debug` is stripped in production for both performance and information
  // hygiene reasons. Production code should never depend on debug logs.
  if (level === 'debug' && isProduction) return;

  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    error,
  };
  activeTransport.emit(entry);
}

export const logger = {
  /** Verbose information for debugging. Stripped in production. */
  debug(message: string, context?: LogContext): void {
    emit('debug', message, context);
  },

  /** Notable but expected events: user actions, navigation, completed flows. */
  info(message: string, context?: LogContext): void {
    emit('info', message, context);
  },

  /** Unexpected but recoverable conditions: degraded behavior, retries, fallbacks. */
  warn(message: string, context?: LogContext): void {
    emit('warn', message, context);
  },

  /**
   * Errors that need investigation. Pass the original Error object so the
   * transport can capture the stack trace and any cause chain.
   */
  error(message: string, error?: Error, context?: LogContext): void {
    emit('error', message, context, error);
  },
};
