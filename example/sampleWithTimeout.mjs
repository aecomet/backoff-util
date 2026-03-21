/**
 * timeoutMs example
 *
 * Stops retrying once the total elapsed time exceeds the limit.
 */
import { BackoffConfig, Utility } from '@aecomet/backoff-util';

const config = new BackoffConfig(100, 50, 500).setTimeoutMs(300);

const utility = Utility.newWithConfig(config);

try {
  await utility.backoff(async () => {
    throw new Error('always fails');
  });
} catch (e) {
  console.log('Caught:', e.message);
  // => Caught: Backoff timed out: total elapsed time exceeded the limit.
}
