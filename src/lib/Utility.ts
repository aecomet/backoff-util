import { BackoffConfig } from '@src/lib/BackoffConfig';
import { CallbackErrorObject } from '@src/types/ErrorCallback';

export class Utility {
  private config: BackoffConfig;

  private constructor(config: BackoffConfig) {
    this.config = config;
  }

  /**
   * Create an instance with config({@link BackoffConfig}) that is set default values.
   * @param config {@link BackoffConfig}
   * @returns {@link Utility}
   */

  static newWithDefault(): Utility {
    const config: BackoffConfig = new BackoffConfig(10, 10, 1000);
    return new Utility(config);
  }

  /**
   * Create an instance with customize config
   * @param config {@link BackoffConfig}
   * @returns {@link Utility}
   */
  static newWithConfig(config: BackoffConfig): Utility {
    return new Utility(config);
  }

  async backoff<T>(callback: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    for (let i = 0; i <= this.config.getRetryCount; i++) {
      const signal = this.config.getSignal;
      if (signal?.aborted) {
        throw new DOMException('Backoff aborted.', 'AbortError');
      }

      try {
        return await callback();
      } catch (error: unknown) {
        if (signal?.aborted) {
          throw new DOMException('Backoff aborted.', 'AbortError');
        }

        const timeoutMs = this.config.getTimeoutMs;
        if (timeoutMs !== undefined && Date.now() - startTime >= timeoutMs) {
          throw Error('Backoff timed out: total elapsed time exceeded the limit.');
        }

        const shouldRetry = this.config.getShouldRetry;
        if (shouldRetry !== undefined && !shouldRetry(error, i)) {
          throw error;
        }

        if (this.hasErrorObject(error)) {
          const onRetry = this.config.getOnRetry;
          if (onRetry !== undefined) {
            onRetry(error, i);
          } else {
            console.warn('error caused, but it will retry after sleep...', 'retry count:', i, 'caused:', error.message);
          }
          await this.wait(i);
        } else {
          console.warn('Unknown error: ', error);
          throw Error('Unknown error');
        }
      }
    }
    throw Error('Over retry, all the callback caused unexpected errors.');
  }

  /**
   * Wait time based on the configured strategy.
   * - exponential: min(minDelay ^ attempt, maxDelay) + jitter
   * - linear:      min(minDelay * attempt, maxDelay) + jitter
   * - fixed:       minDelay + jitter
   */
  private async wait(attempt: number): Promise<void> {
    const { getMinDelay: min, getMaxDelay: max, getStrategy: strategy } = this.config;
    let base: number;

    if (strategy === 'linear') {
      base = Math.min(min * (attempt + 1), max);
    } else if (strategy === 'fixed') {
      base = min;
    } else {
      base = Math.min(Math.pow(min, this.config.getRetryCount), max);
    }

    const jitter: number = Math.random() * 9 + 1;

    return new Promise((res) => setTimeout(res, base + jitter));
  }

  /**
   * Whether error has obejct
   * @param error caused error
   * @returns {@link CallbackErrorObject} or unknown error
   */
  private hasErrorObject(error: unknown): error is CallbackErrorObject {
    return typeof error === 'object' && error != null;
  }
}
