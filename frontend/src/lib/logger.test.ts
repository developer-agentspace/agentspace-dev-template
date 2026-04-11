// The no-console rule is disabled for this file via a pattern override in
// `eslint.config.js`. The console spies in the "default transports" suite
// require direct console references.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logger, resetLogTransport, setLogTransport } from './logger';
import type { LogEntry, LogTransport } from './logger';

function createCapturingTransport(): { transport: LogTransport; entries: LogEntry[] } {
  const entries: LogEntry[] = [];
  return {
    transport: {
      emit(entry) {
        entries.push(entry);
      },
    },
    entries,
  };
}

describe('logger', () => {
  let capture: ReturnType<typeof createCapturingTransport>;

  beforeEach(() => {
    capture = createCapturingTransport();
    setLogTransport(capture.transport);
  });

  afterEach(() => {
    resetLogTransport();
  });

  describe('info', () => {
    it('emits an info entry with the message', () => {
      logger.info('hello');
      expect(capture.entries).toHaveLength(1);
      expect(capture.entries[0].level).toBe('info');
      expect(capture.entries[0].message).toBe('hello');
    });

    it('attaches structured context when provided', () => {
      logger.info('user clicked export', { feature: 'reports', action: 'export-csv' });
      expect(capture.entries[0].context).toEqual({ feature: 'reports', action: 'export-csv' });
    });

    it('emits an ISO 8601 timestamp', () => {
      logger.info('hello');
      expect(capture.entries[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('warn', () => {
    it('emits a warn entry', () => {
      logger.warn('retrying failed request', { feature: 'api', statusCode: 503 });
      expect(capture.entries[0].level).toBe('warn');
      expect(capture.entries[0].context?.statusCode).toBe(503);
    });
  });

  describe('error', () => {
    it('emits an error entry with the Error object attached', () => {
      const err = new Error('boom');
      logger.error('something exploded', err, { feature: 'auth' });

      expect(capture.entries[0].level).toBe('error');
      expect(capture.entries[0].error).toBe(err);
      expect(capture.entries[0].context?.feature).toBe('auth');
    });

    it('does not require an Error object', () => {
      logger.error('something exploded but I do not have an Error');
      expect(capture.entries[0].level).toBe('error');
      expect(capture.entries[0].error).toBeUndefined();
    });
  });

  describe('debug', () => {
    it('emits a debug entry in development', () => {
      // The default mode in vitest is 'test', not 'production', so debug should fire.
      logger.debug('verbose detail', { traceId: 'abc-123' });
      expect(capture.entries).toHaveLength(1);
      expect(capture.entries[0].level).toBe('debug');
    });
  });
});

describe('setLogTransport / resetLogTransport', () => {
  afterEach(() => {
    resetLogTransport();
  });

  it('routes subsequent calls to the new transport', () => {
    const a = createCapturingTransport();
    const b = createCapturingTransport();

    setLogTransport(a.transport);
    logger.info('to a');
    setLogTransport(b.transport);
    logger.info('to b');

    expect(a.entries.map((e) => e.message)).toEqual(['to a']);
    expect(b.entries.map((e) => e.message)).toEqual(['to b']);
  });

  it('resetLogTransport restores the default transport', () => {
    const captured = createCapturingTransport();
    setLogTransport(captured.transport);
    resetLogTransport();

    // We can't easily assert which transport is active, but we can verify the
    // captured transport is no longer receiving entries.
    logger.info('after reset');
    expect(captured.entries).toHaveLength(0);
  });
});

describe('default transports', () => {
  it('logs to console.info in development when no custom transport is set', () => {
    resetLogTransport();
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logger.info('via default transport');

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs error level to console.error', () => {
    resetLogTransport();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    logger.error('boom', new Error('inner'));

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
