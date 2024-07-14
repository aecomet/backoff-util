export class BackoffConfig {
  private retryCount: number = 0;
  private minDelay: number = 0;
  private maxDelay: number = 0;

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
}
