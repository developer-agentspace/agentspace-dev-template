import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearAllFlagOverrides, setFlagOverride } from './flags';
import { FeatureFlag } from './FeatureFlag';

describe('FeatureFlag', () => {
  beforeEach(() => {
    clearAllFlagOverrides();
  });

  afterEach(() => {
    clearAllFlagOverrides();
  });

  it('renders children when the flag is on', () => {
    setFlagOverride('example-csv-export', true);
    render(
      <FeatureFlag flag="example-csv-export">
        <span>visible</span>
      </FeatureFlag>,
    );
    expect(screen.getByText('visible')).toBeInTheDocument();
  });

  it('renders nothing by default when the flag is off', () => {
    setFlagOverride('example-csv-export', false);
    const { container } = render(
      <FeatureFlag flag="example-csv-export">
        <span>visible</span>
      </FeatureFlag>,
    );
    expect(container.textContent).toBe('');
  });

  it('renders the fallback when the flag is off and a fallback is provided', () => {
    setFlagOverride('example-csv-export', false);
    render(
      <FeatureFlag flag="example-csv-export" fallback={<span>nope</span>}>
        <span>visible</span>
      </FeatureFlag>,
    );
    expect(screen.getByText('nope')).toBeInTheDocument();
  });
});
