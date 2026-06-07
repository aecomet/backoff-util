/**
 * timeoutMs example
 *
 * Stops retrying once the total elapsed time exceeds the limit.
 */
import { Utility } from '@aecomet/backoff-util';

const utility = new Utility({ retryCount: 100, minDelay: 50, maxDelay: 500, timeoutMs: 300 });

try {
  await utility.backoff(async () => {
    throw new Error('always fails');
  });
} catch (e) {
  console.log('Caught:', e.message);
  // => Caught: Backoff timed out: total elapsed time exceeded the limit.
}
