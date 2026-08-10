import type { BackoffContext, BackoffOptions, DelayFn, JitterFn } from '@src/types';
import { createExponentialDelay, createLinearDelay, createFixedDelay } from '@src/delay';
import { createFullJitter, createNoJitter, createDecorrelatedJitter } from '@src/jitter';
import { BackoffAbortError, BackoffError, BackoffTimeoutError } from '@src/errors';

function normalizeDelay(delay: BackoffOptions['delay'], minDelay: number, maxDelay: number, factor: number): DelayFn {
  if (typeof delay === 'function') return delay;
  switch (delay) {
    case 'linear':
      return createLinearDelay({ minDelay, maxDelay });
    case 'fixed':
      return createFixedDelay({ minDelay });
    default:
      return createExponentialDelay({ minDelay, maxDelay, factor });
  }
}

function normalizeJitter(jitter: BackoffOptions['jitter'], minDelay: number, factor: number): JitterFn {
  if (typeof jitter === 'function') return jitter;
  switch (jitter) {
    case 'none':
      return createNoJitter();
    case 'decorrelated':
      return createDecorrelatedJitter({ minDelay, factor });
    default:
      return createFullJitter();
  }
}

export class Utility {
  private readonly delay: DelayFn;
  private readonly jitter: JitterFn;
  private readonly retryCount: number;
  private readonly shouldRetry?: (ctx: BackoffContext) => boolean;
  private readonly onRetry?: (ctx: BackoffContext) => void | Promise<void>;
  private readonly timeoutMs?: number;
  private readonly signal?: AbortSignal;

  constructor(options: BackoffOptions = {}) {
    const retryCount = options.retryCount ?? 10;
    const minDelay = options.minDelay ?? 10;
    const maxDelay = options.maxDelay ?? 1000;
    const factor = options.factor ?? 2;

    this.retryCount = retryCount;
    this.shouldRetry = options.shouldRetry;
    this.onRetry = options.onRetry;
    this.timeoutMs = options.timeoutMs;
    this.signal = options.signal;

    this.delay = normalizeDelay(options.delay, minDelay, maxDelay, factor);
    this.jitter = normalizeJitter(options.jitter, minDelay, factor);
  }

  async backoff<T>(callback: () => T | Promise<T>): Promise<T> {
    const startTime = Date.now();
    const { signal, timeoutMs, shouldRetry, onRetry, delay, jitter, retryCount } = this;
    let lastError: unknown;

    for (let i = 0; i <= retryCount; i++) {
      if (signal?.aborted) throw new BackoffAbortError();

      try {
        return await callback();
      } catch (error) {
        if (signal?.aborted) throw new BackoffAbortError();

        lastError = error;

        const elapsed = Date.now() - startTime;
        if (timeoutMs !== undefined && elapsed >= timeoutMs) {
          throw new BackoffTimeoutError();
        }

        const isLastAttempt = i === retryCount;
        const ctx: BackoffContext = { attempt: i, error, elapsed, remaining: retryCount - i, nextDelay: undefined };

        if (shouldRetry && !shouldRetry(ctx)) throw error;

        let waitTime = 0;
        if (!isLastAttempt) {
          const raw = delay(ctx);
          waitTime = jitter(raw);
          ctx.nextDelay = waitTime;
        }

        if (onRetry) await onRetry(ctx);

        if (isLastAttempt) break;

        await this.sleep(waitTime, startTime, timeoutMs, signal);
      }
    }
    throw new BackoffError('Over retry, all the callback caused unexpected errors.', { cause: lastError });
  }

  private sleep(
    waitTime: number,
    startTime: number,
    timeoutMs: number | undefined,
    signal: AbortSignal | undefined
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        resolve();
      }, waitTime);

      const onAbort = () => {
        cleanup();
        reject(new BackoffAbortError());
      };

      const checkTimeout = () => {
        cleanup();
        reject(new BackoffTimeoutError());
      };

      let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
      if (timeoutMs !== undefined) {
        const remaining = timeoutMs - (Date.now() - startTime);
        timeoutTimer = setTimeout(checkTimeout, Math.max(remaining, 0));
      }

      signal?.addEventListener('abort', onAbort, { once: true });

      function cleanup() {
        clearTimeout(timer);
        if (timeoutTimer) clearTimeout(timeoutTimer);
        signal?.removeEventListener('abort', onAbort);
      }
    });
  }
}
