import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearAllFlagOverrides,
  clearFlagOverride,
  isEnabled,
  setFlagOverride,
  subscribeToFlagChanges,
} from './flags';
import { FLAG_METADATA, flagToEnvVar } from './flags-config';

describe('flagToEnvVar', () => {
  it('converts kebab-case flag names to VITE_FLAG_UPPER_SNAKE', () => {
    expect(flagToEnvVar('example-new-dashboard')).toBe('VITE_FLAG_EXAMPLE_NEW_DASHBOARD');
    expect(flagToEnvVar('example-csv-export')).toBe('VITE_FLAG_EXAMPLE_CSV_EXPORT');
  });
});

describe('isEnabled', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns the metadata default when no override and no env value is set', () => {
    expect(isEnabled('example-new-dashboard')).toBe(FLAG_METADATA['example-new-dashboard'].defaultValue);
  });

  it('returns true when localStorage override is "true"', () => {
    window.localStorage.setItem('flag:example-new-dashboard', 'true');
    expect(isEnabled('example-new-dashboard')).toBe(true);
  });

  it('returns false when localStorage override is "false"', () => {
    window.localStorage.setItem('flag:example-new-dashboard', 'false');
    expect(isEnabled('example-new-dashboard')).toBe(false);
  });

  it('falls back to default when localStorage override is malformed', () => {
    window.localStorage.setItem('flag:example-new-dashboard', 'maybe');
    expect(isEnabled('example-new-dashboard')).toBe(FLAG_METADATA['example-new-dashboard'].defaultValue);
  });

  it('reads env var as fallback when no localStorage override is set', () => {
    vi.stubEnv('VITE_FLAG_EXAMPLE_NEW_DASHBOARD', 'true');
    expect(isEnabled('example-new-dashboard')).toBe(true);
    vi.unstubAllEnvs();
  });

  it('localStorage override beats env var', () => {
    vi.stubEnv('VITE_FLAG_EXAMPLE_NEW_DASHBOARD', 'false');
    window.localStorage.setItem('flag:example-new-dashboard', 'true');
    expect(isEnabled('example-new-dashboard')).toBe(true);
    vi.unstubAllEnvs();
  });
});

describe('setFlagOverride / clearFlagOverride', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('writes to localStorage and isEnabled reflects the new value', () => {
    setFlagOverride('example-csv-export', true);
    expect(window.localStorage.getItem('flag:example-csv-export')).toBe('true');
    expect(isEnabled('example-csv-export')).toBe(true);
  });

  it('clearFlagOverride removes the override and falls back to default', () => {
    setFlagOverride('example-csv-export', true);
    clearFlagOverride('example-csv-export');
    expect(window.localStorage.getItem('flag:example-csv-export')).toBeNull();
    expect(isEnabled('example-csv-export')).toBe(FLAG_METADATA['example-csv-export'].defaultValue);
  });
});

describe('clearAllFlagOverrides', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('removes only flag-prefixed keys, not unrelated localStorage entries', () => {
    setFlagOverride('example-new-dashboard', true);
    setFlagOverride('example-csv-export', true);
    window.localStorage.setItem('unrelated-key', 'should-survive');

    clearAllFlagOverrides();

    expect(window.localStorage.getItem('flag:example-new-dashboard')).toBeNull();
    expect(window.localStorage.getItem('flag:example-csv-export')).toBeNull();
    expect(window.localStorage.getItem('unrelated-key')).toBe('should-survive');
  });
});

describe('subscribeToFlagChanges', () => {
  let callback: ReturnType<typeof vi.fn<() => void>>;
  let unsubscribe: () => void;

  beforeEach(() => {
    callback = vi.fn<() => void>();
    unsubscribe = subscribeToFlagChanges(callback);
  });

  afterEach(() => {
    unsubscribe();
    window.localStorage.clear();
  });

  it('fires when setFlagOverride dispatches the override event', () => {
    setFlagOverride('example-new-dashboard', true);
    expect(callback).toHaveBeenCalled();
  });

  it('fires when clearFlagOverride dispatches the override event', () => {
    setFlagOverride('example-new-dashboard', true);
    callback.mockClear();
    clearFlagOverride('example-new-dashboard');
    expect(callback).toHaveBeenCalled();
  });

  it('stops firing after unsubscribe', () => {
    unsubscribe();
    setFlagOverride('example-new-dashboard', true);
    expect(callback).not.toHaveBeenCalled();
  });
});
