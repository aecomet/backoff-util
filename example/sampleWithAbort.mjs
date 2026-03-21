/**
 * AbortSignal example
 *
 * Cancels the retry loop from outside using AbortController.
 */
import { BackoffConfig, Utility } from '@aecomet/backoff-util';

const controller = new AbortController();

// Abort after 200ms
setTimeout(() => {
  console.log('Aborting...');
  controller.abort();
}, 200);

const config = new BackoffConfig(100, 50, 500).setSignal(controller.signal);
const utility = Utility.newWithConfig(config);

try {
  await utility.backoff(async () => {
    throw new Error('always fails');
  });
} catch (e) {
  console.log('Caught:', e.message);
  // => Caught: Backoff aborted.
}
