/**
 * AbortSignal example
 *
 * Cancels the retry loop from outside using AbortController.
 */
import { Utility } from '@aecomet/backoff-util';

const controller = new AbortController();

// Abort after 200ms
setTimeout(() => {
  console.log('Aborting...');
  controller.abort();
}, 200);

const utility = new Utility({
  retryCount: 100,
  minDelay: 50,
  maxDelay: 500,
  signal: controller.signal
});

try {
  await utility.backoff(async () => {
    throw new Error('always fails');
  });
} catch (e) {
  console.log('Caught:', e.message);
  // => Caught: Backoff aborted.
}
