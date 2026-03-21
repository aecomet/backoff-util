export type BackoffStrategy = 'exponential' | 'linear' | 'fixed';

export class BackoffConfig {
  private retryCount: number = 0;
  private minDelay: number = 0;
  private maxDelay: number = 0;
  private _shouldRetry: ((error: unknown, attempt: number) => boolean) | undefined = undefined;
  private _onRetry: ((error: unknown, attempt: number) => void) | undefined = undefined;
  private _timeoutMs: number | undefined = undefined;
  private _strategy: BackoffStrategy = 'exponential';
  private _signal: AbortSignal | undefined = undefined;

  constructor(retryCount: number, minDelay: number, maxDelay: number) {
    this.retryCount = retryCount;
    this.minDelay = minDelay;
    this.maxDelay = maxDelay;
  }

  setRetryCount(retryCount: number): BackoffConfig {
    this.retryCount = retryCount;
    return this;
  }

  get getRetryCount(): number {
    return this.retryCount;
  }

  setMinDelay(minDelay: number): BackoffConfig {
    this.minDelay = minDelay;
    return this;
  }

  get getMinDelay(): number {
    return this.minDelay;
  }

  setMaxDelay(maxDelay: number): BackoffConfig {
    this.maxDelay = maxDelay;
    return this;
  }

  get getMaxDelay(): number {
    return this.maxDelay;
  }

  setShouldRetry(fn: (error: unknown, attempt: number) => boolean): BackoffConfig {
    this._shouldRetry = fn;
    return this;
  }

  get getShouldRetry(): ((error: unknown, attempt: number) => boolean) | undefined {
    return this._shouldRetry;
  }

  setOnRetry(fn: (error: unknown, attempt: number) => void): BackoffConfig {
    this._onRetry = fn;
    return this;
  }

  get getOnRetry(): ((error: unknown, attempt: number) => void) | undefined {
    return this._onRetry;
  }

  setTimeoutMs(ms: number): BackoffConfig {
    this._timeoutMs = ms;
    return this;
  }

  get getTimeoutMs(): number | undefined {
    return this._timeoutMs;
  }

  setStrategy(strategy: BackoffStrategy): BackoffConfig {
    this._strategy = strategy;
    return this;
  }

  get getStrategy(): BackoffStrategy {
    return this._strategy;
  }

  setSignal(signal: AbortSignal): BackoffConfig {
    this._signal = signal;
    return this;
  }

  get getSignal(): AbortSignal | undefined {
    return this._signal;
  }
}
