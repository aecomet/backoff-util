import { describe, expect, test, vi } from 'vitest';
import { Utility } from '@src/index';
import { BackoffAbortError, BackoffError, BackoffTimeoutError } from '@src/errors';

describe('Utility', () => {
  test('returns value when callback succeeds on first attempt', async () => {
    const util = new Utility();
    await expect(util.backoff(() => Promise.resolve('ok'))).resolves.toBe('ok');
  });

  test('recovers after errors and returns final value', { timeout: 10000 }, async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('e1'))
      .mockRejectedValueOnce(new Error('e2'))
      .mockResolvedValueOnce('ok');

    const util = new Utility({ retryCount: 5, minDelay: 1, maxDelay: 5, jitter: 'none' });
    const result = await util.backoff(fn);

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('throws when all retries exhausted', { timeout: 10000 }, async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    const util = new Utility({ retryCount: 2, minDelay: 1, maxDelay: 5, jitter: 'none' });

    await expect(util.backoff(fn)).rejects.toThrow('Over retry');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('shouldRetry stops retrying when predicate returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fatal'));
    const util = new Utility({
      retryCount: 5,
      minDelay: 10,
      maxDelay: 100,
      shouldRetry: () => false
    });

    await expect(util.backoff(fn)).rejects.toThrow('fatal');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('onRetry callback is called with context', { timeout: 10000 }, async () => {
    const onRetry = vi.fn();
    const fn = vi.fn().mockRejectedValueOnce(new Error('transient')).mockResolvedValueOnce('ok');

    const util = new Utility({ retryCount: 5, minDelay: 1, maxDelay: 5, jitter: 'none', onRetry });
    await util.backoff(fn);

    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRetry).toHaveBeenCalledWith({
      attempt: 0,
      error: expect.any(Error),
      elapsed: expect.any(Number),
      remaining: 5,
      nextDelay: expect.any(Number)
    });
  });

  test('backoff throws when timeoutMs is exceeded', { timeout: 10000 }, async () => {
    const fn = vi.fn().mockRejectedValue(new Error('slow'));
    const util = new Utility({ retryCount: 100, minDelay: 5, maxDelay: 20, jitter: 'none', timeoutMs: 30 });

    await expect(util.backoff(fn)).rejects.toThrow('timed out');
  });

  test('backoff aborts when AbortSignal is triggered', async () => {
    const controller = new AbortController();
    const fn = vi.fn().mockImplementation(() => {
      controller.abort();
      throw new Error('error');
    });

    const util = new Utility({ retryCount: 5, minDelay: 10, maxDelay: 100, signal: controller.signal });

    await expect(util.backoff(fn)).rejects.toThrow('Backoff aborted.');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('accepts custom delay function (DI point)', async () => {
    const customDelay = vi.fn().mockReturnValue(1);
    const fn = vi.fn().mockRejectedValueOnce(new Error('e1')).mockResolvedValueOnce('ok');

    const util = new Utility({ retryCount: 5, minDelay: 10, maxDelay: 100, delay: customDelay, jitter: 'none' });
    await util.backoff(fn);

    expect(customDelay).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt: 0,
        error: expect.any(Error),
        elapsed: expect.any(Number),
        remaining: 5
      })
    );
  });

  test('accepts custom jitter function (DI point)', async () => {
    const customJitter = vi.fn().mockReturnValue(1);
    const fn = vi.fn().mockRejectedValueOnce(new Error('e1')).mockResolvedValueOnce('ok');

    const util = new Utility({ retryCount: 5, minDelay: 10, maxDelay: 100, jitter: customJitter });
    await util.backoff(fn);

    expect(customJitter).toHaveBeenCalledWith(10);
  });

  test('context includes remaining retry count', { timeout: 10000 }, async () => {
    const fn = vi.fn().mockRejectedValue(new Error('e'));
    const delays: number[] = [];
    const util = new Utility({
      retryCount: 3,
      minDelay: 1,
      maxDelay: 5,
      jitter: 'none',
      delay: (ctx) => {
        delays.push(ctx.remaining);
        return 1;
      }
    });

    await util.backoff(fn).catch(() => {});

    expect(delays).toEqual([3, 2, 1]);
  });

  test('onRetry receives nextDelay for telemetry', { timeout: 10000 }, async () => {
    const onRetry = vi.fn();
    const fn = vi.fn().mockRejectedValueOnce(new Error('e1')).mockResolvedValueOnce('ok');
    const util = new Utility({
      retryCount: 5,
      minDelay: 100,
      maxDelay: 100,
      jitter: 'none',
      onRetry
    });

    await util.backoff(fn);

    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt: 0,
        remaining: 5,
        nextDelay: 100
      })
    );
  });

  test('onRetry receives undefined nextDelay on final attempt', { timeout: 10000 }, async () => {
    const onRetry = vi.fn();
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    const util = new Utility({ retryCount: 1, minDelay: 1, maxDelay: 5, jitter: 'none', onRetry });

    await util.backoff(fn).catch(() => {});

    expect(onRetry).toHaveBeenLastCalledWith(
      expect.objectContaining({
        attempt: 1,
        remaining: 0,
        nextDelay: undefined
      })
    );
  });

  test('aborts immediately during delay when signal is triggered', async () => {
    const controller = new AbortController();
    const fn = vi.fn().mockRejectedValueOnce(new Error('e1')).mockRejectedValue(new Error('e2'));
    const util = new Utility({
      retryCount: 5,
      minDelay: 1000,
      maxDelay: 1000,
      jitter: 'none',
      signal: controller.signal
    });

    setTimeout(() => controller.abort(), 10);
    const start = Date.now();
    await expect(util.backoff(fn)).rejects.toThrow('Backoff aborted.');
    expect(Date.now() - start).toBeLessThan(500);
  });

  test('respects timeout during delay without waiting for full delay', { timeout: 10000 }, async () => {
    const fn = vi.fn().mockRejectedValue(new Error('slow'));
    const util = new Utility({
      retryCount: 100,
      minDelay: 10000,
      maxDelay: 10000,
      jitter: 'none',
      timeoutMs: 50
    });

    const start = Date.now();
    await expect(util.backoff(fn)).rejects.toThrow('timed out');
    expect(Date.now() - start).toBeLessThan(500);
  });

  test('throws BackoffError with cause when all retries are exhausted', async () => {
    const cause = new Error('fatal failure');
    const fn = vi.fn().mockRejectedValue(cause);
    const util = new Utility({ retryCount: 2, minDelay: 1, maxDelay: 5, jitter: 'none' });

    await expect(util.backoff(fn)).rejects.toSatisfy(
      (e: unknown) => e instanceof BackoffError && (e as Error).cause === cause
    );
  });

  test('throws BackoffTimeoutError (instanceof BackoffError)', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('slow'));
    const util = new Utility({ retryCount: 100, minDelay: 5, maxDelay: 20, jitter: 'none', timeoutMs: 30 });

    await expect(util.backoff(fn)).rejects.toBeInstanceOf(BackoffTimeoutError);
    await expect(util.backoff(fn)).rejects.toBeInstanceOf(BackoffError);
  });

  test('throws BackoffAbortError (instanceof BackoffError)', async () => {
    const controller = new AbortController();
    const fn = vi.fn().mockRejectedValueOnce(new Error('e1')).mockRejectedValue(new Error('e2'));
    const util = new Utility({
      retryCount: 5,
      minDelay: 1000,
      maxDelay: 1000,
      jitter: 'none',
      signal: controller.signal
    });

    setTimeout(() => controller.abort(), 10);
    await expect(util.backoff(fn)).rejects.toBeInstanceOf(BackoffAbortError);
    await expect(util.backoff(fn)).rejects.toBeInstanceOf(BackoffError);
  });

  test('accepts a synchronous callback', async () => {
    const util = new Utility();
    const result = await util.backoff(() => 42);
    expect(result).toBe(42);
  });

  test('supports async onRetry callback', { timeout: 10000 }, async () => {
    const order: string[] = [];
    const fn = vi.fn().mockRejectedValueOnce(new Error('e1')).mockResolvedValueOnce('ok');

    const util = new Utility({
      retryCount: 5,
      minDelay: 1,
      maxDelay: 5,
      jitter: 'none',
      onRetry: async () => {
        await new Promise((r) => setTimeout(r, 10));
        order.push('retry');
      }
    });

    await util.backoff(fn);
    expect(order).toEqual(['retry']);
  });
});
