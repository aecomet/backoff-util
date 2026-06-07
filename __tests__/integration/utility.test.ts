import { describe, expect, test, vi } from 'vitest';
import { Utility } from '@src/index';

describe('Utility', () => {
  test('returns value when callback succeeds on first attempt', async () => {
    const util = new Utility();
    await expect(util.backoff(() => Promise.resolve('ok'))).resolves.toBe('ok');
  });

  test('recovers after errors and returns final value', { timeout: 10000 }, async () => {
    const fn = vi.fn()
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
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValueOnce('ok');

    const util = new Utility({ retryCount: 5, minDelay: 1, maxDelay: 5, jitter: 'none', onRetry });
    await util.backoff(fn);

    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRetry).toHaveBeenCalledWith({
      attempt: 0,
      error: expect.any(Error),
      elapsed: expect.any(Number)
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
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('e1'))
      .mockResolvedValueOnce('ok');

    const util = new Utility({ retryCount: 5, minDelay: 10, maxDelay: 100, delay: customDelay, jitter: 'none' });
    await util.backoff(fn);

    expect(customDelay).toHaveBeenCalledWith({
      attempt: 0,
      error: expect.any(Error),
      elapsed: expect.any(Number)
    });
  });

  test('accepts custom jitter function (DI point)', async () => {
    const customJitter = vi.fn().mockReturnValue(1);
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('e1'))
      .mockResolvedValueOnce('ok');

    const util = new Utility({ retryCount: 5, minDelay: 10, maxDelay: 100, jitter: customJitter });
    await util.backoff(fn);

    expect(customJitter).toHaveBeenCalledWith(10);
  });
});
