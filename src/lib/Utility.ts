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

  async backoff(callback: () => {}): Promise<any> {
    for (let i = 0; i <= this.config.getRetryCount; i++) {
      try {
        return await callback();
      } catch (error: unknown) {
        if (this.hasErrorObject(error)) {
          console.warn('error caused, but it will retry after sleep...', 'retry count:', i, 'caused:', error.message);
          await this.wait();
        } else {
          console.warn('Unknown error: ', error);
          throw Error('Unknown error');
        }
      }
    }
    throw Error('Over retry, all the callback caused unexpected errors.');
  }

  /**
   * Wait time
   * @returns void after backoff sleep
   */
  private async wait(): Promise<void> {
    const estimatedTime: number = Math.pow(this.config.getMinDelay, this.config.getRetryCount);
    const backoff: number = Math.min(estimatedTime, this.config.getMaxDelay);
    const randomSleepTime: number = Math.random() * 9 + 1;

    return new Promise((res) => setTimeout(res, backoff + randomSleepTime));
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
