/**
 * React hook for feature flag checks. Re-renders when the flag override changes.
 *
 * Lives in its own file so the React Fast Refresh ESLint rule
 * (`react-refresh/only-export-components`) is not violated by mixing
 * a hook export with component exports in the same file.
 *
 * For framework-agnostic checks, use `isEnabled` from `flags.ts`.
 * For a wrapper component, use `<FeatureFlag>` from `FeatureFlag.tsx`.
 *
 * @example
 * function Dashboard() {
 *   const newLayout = useFlag('example-new-dashboard');
 *   return newLayout ? <NewDashboard /> : <OldDashboard />;
 * }
 */

import { useSyncExternalStore } from 'react';

import { isEnabled, subscribeToFlagChanges } from './flags';
import { FLAG_METADATA } from './flags-config';
import type { FlagName } from './flags-config';

export function useFlag(flag: FlagName): boolean {
  return useSyncExternalStore(
    subscribeToFlagChanges,
    () => isEnabled(flag),
    () => FLAG_METADATA[flag].defaultValue,
  );
}
