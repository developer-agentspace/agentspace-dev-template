/**
 * Central registry of feature flags.
 *
 * Adding a new flag:
 *   1. Add the flag name to the `FLAG_NAMES` tuple below
 *   2. Add a matching entry to `FLAG_METADATA` with description, default, owner, and expiry
 *   3. Add a matching `VITE_FLAG_<UPPER_SNAKE>` entry to `.env.example`
 *   4. Use it in code via `isEnabled('your-flag')` or `useFlag('your-flag')`
 *
 * Removing a flag:
 *   - When a flag is fully rolled out (or abandoned), delete the code that
 *     branches on it AND remove the entry from this file. Stale flags rot
 *     into permanent dead code if you don't.
 *
 * Every flag MUST have an expiry date. Flags without an expiry are bugs.
 * The expiry is when the flag should be reviewed for removal — it does not
 * automatically disable the flag.
 */

// The single source of truth for valid flag names. Adding a flag here
// makes it available everywhere via the typed `FlagName` union.
export const FLAG_NAMES = [
  'example-new-dashboard',
  'example-csv-export',
] as const;

export type FlagName = (typeof FLAG_NAMES)[number];

interface FlagMetadata {
  /** One-line description of what the flag controls. */
  description: string;
  /** Default value if the env var is unset and no localStorage override exists. */
  defaultValue: boolean;
  /** Who owns this flag — used to chase removal when it expires. */
  owner: string;
  /** YYYY-MM-DD — date this flag should be reviewed for removal. */
  expiresOn: string;
}

export const FLAG_METADATA: Record<FlagName, FlagMetadata> = {
  'example-new-dashboard': {
    description: 'Example flag — gates the redesigned dashboard layout',
    defaultValue: false,
    owner: 'tanay',
    expiresOn: '2026-07-01',
  },
  'example-csv-export': {
    description: 'Example flag — enables CSV export buttons on report tables',
    defaultValue: false,
    owner: 'tanay',
    expiresOn: '2026-07-01',
  },
};

/**
 * Convert a flag name to its environment variable name.
 *
 * Example: 'example-new-dashboard' → 'VITE_FLAG_EXAMPLE_NEW_DASHBOARD'
 */
export function flagToEnvVar(flag: FlagName): string {
  return `VITE_FLAG_${flag.replace(/-/g, '_').toUpperCase()}`;
}
