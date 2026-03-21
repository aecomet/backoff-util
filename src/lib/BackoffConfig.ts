export class BackoffConfig {
  private retryCount: number = 0;
  private minDelay: number = 0;
  private maxDelay: number = 0;
  private _shouldRetry: ((error: unknown, attempt: number) => boolean) | undefined = undefined;

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
}
