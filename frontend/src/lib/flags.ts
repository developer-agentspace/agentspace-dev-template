/**
 * Feature flag helpers (framework-agnostic).
 *
 * Resolution order (first match wins):
 *   1. localStorage override   — for development, allows toggling without env changes
 *   2. Environment variable    — VITE_FLAG_<UPPER_SNAKE> = 'true' | 'false'
 *   3. defaultValue from FLAG_METADATA
 *
 * The localStorage override is intentionally available in production builds too,
 * so support engineers can toggle a flag for a single user session without a
 * redeploy. The override key is namespaced under `flag:` so it cannot collide
 * with other localStorage usage.
 *
 * For React component usage (hook + wrapper component), see `flags-react.tsx`.
 */

import { FLAG_METADATA, flagToEnvVar } from './flags-config';
import type { FlagName } from './flags-config';

const OVERRIDE_PREFIX = 'flag:';
export const OVERRIDE_EVENT = 'feature-flag-override-changed';

function overrideKey(flag: FlagName): string {
  return `${OVERRIDE_PREFIX}${flag}`;
}

function readLocalStorageOverride(flag: FlagName): boolean | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(overrideKey(flag));
  if (raw === null) return null;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return null;
}

function readEnvValue(flag: FlagName): boolean | null {
  const envVar = flagToEnvVar(flag);
  const raw = (import.meta.env as Record<string, string | undefined>)[envVar];
  if (raw === undefined) return null;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return null;
}

/**
 * Synchronous flag check. Use in non-React code (utilities, event handlers).
 * In components, prefer `useFlag` from `flags-react.tsx` so the UI updates
 * when the override changes.
 */
export function isEnabled(flag: FlagName): boolean {
  const override = readLocalStorageOverride(flag);
  if (override !== null) return override;

  const envValue = readEnvValue(flag);
  if (envValue !== null) return envValue;

  return FLAG_METADATA[flag].defaultValue;
}

/**
 * Set a localStorage override for a flag. Persists across page reloads.
 * Use in dev tooling or support flows. Dispatches an event so any
 * `useFlag` hooks re-render immediately.
 */
export function setFlagOverride(flag: FlagName, value: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(overrideKey(flag), value ? 'true' : 'false');
  window.dispatchEvent(new Event(OVERRIDE_EVENT));
}

/**
 * Clear the localStorage override for a single flag, falling back to env / default.
 */
export function clearFlagOverride(flag: FlagName): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(overrideKey(flag));
  window.dispatchEvent(new Event(OVERRIDE_EVENT));
}

/**
 * Clear every flag override. Useful in tests and "reset to defaults" UI.
 */
export function clearAllFlagOverrides(): void {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(OVERRIDE_PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  window.dispatchEvent(new Event(OVERRIDE_EVENT));
}

/**
 * Subscribe to flag override changes. Returns an unsubscribe function.
 * Used internally by `useFlag` (`flags-react.tsx`) but also exported for
 * advanced use cases.
 */
export function subscribeToFlagChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(OVERRIDE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(OVERRIDE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
