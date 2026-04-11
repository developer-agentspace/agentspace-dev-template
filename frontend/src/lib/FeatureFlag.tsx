/**
 * Component wrapper for conditional rendering based on a feature flag.
 *
 * Cleaner than ternaries when the conditional content is large. Lives in its
 * own file so the React Fast Refresh ESLint rule
 * (`react-refresh/only-export-components`) sees a component-only export.
 *
 * @example
 * <FeatureFlag flag="example-csv-export" fallback={null}>
 *   <button onClick={exportCsv}>Export CSV</button>
 * </FeatureFlag>
 */

import type { ReactNode } from 'react';

import { useFlag } from './useFlag';
import type { FlagName } from './flags-config';

interface FeatureFlagProps {
  flag: FlagName;
  children: ReactNode;
  /** Optional fallback to render when the flag is OFF. */
  fallback?: ReactNode;
}

export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const enabled = useFlag(flag);
  return enabled ? <>{children}</> : <>{fallback}</>;
}
