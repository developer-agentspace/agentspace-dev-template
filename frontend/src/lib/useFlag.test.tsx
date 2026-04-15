import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearAllFlagOverrides, setFlagOverride } from './flags';
import { useFlag } from './useFlag';
import type { FlagName } from './flags-config';

function FlagProbe({ flag }: { flag: FlagName }) {
  const enabled = useFlag(flag);
  return <span data-testid="probe">{enabled ? 'on' : 'off'}</span>;
}

describe('useFlag', () => {
  beforeEach(() => {
    clearAllFlagOverrides();
  });

  afterEach(() => {
    clearAllFlagOverrides();
  });

  it('renders the current value of the flag', () => {
    setFlagOverride('example-new-dashboard', true);
    render(<FlagProbe flag="example-new-dashboard" />);
    expect(screen.getByTestId('probe')).toHaveTextContent('on');
  });

  it('re-renders when the override changes after mount', () => {
    render(<FlagProbe flag="example-new-dashboard" />);
    expect(screen.getByTestId('probe')).toHaveTextContent('off');

    act(() => {
      setFlagOverride('example-new-dashboard', true);
    });

    expect(screen.getByTestId('probe')).toHaveTextContent('on');
  });
});
