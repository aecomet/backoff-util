/**
 * shouldRetry example
 *
 * Retries only on "retryable" errors (e.g. 5xx).
 * Stops immediately on "fatal" errors (e.g. 4xx).
 */
import { Utility } from '@aecomet/backoff-util';

let attempt = 0;

const utility = new Utility({
  retryCount: 5,
  minDelay: 10,
  maxDelay: 500,
  shouldRetry: (ctx) => {
    // Only retry when the error message starts with "5" (simulate 5xx)
    return ctx.error instanceof Error && ctx.error.message.startsWith('5');
  }
});

// --- Case 1: retryable error, eventually succeeds ---
attempt = 0;
const result = await utility.backoff(async () => {
  attempt++;
  if (attempt < 3) throw new Error('503 Service Unavailable');
  return `Succeeded after ${attempt} attempts`;
});
console.log(result);
// => Succeeded after 3 attempts

// --- Case 2: fatal error, stops immediately ---
try {
  await utility.backoff(async () => {
    throw new Error('404 Not Found');
  });
} catch (e) {
  console.log('Stopped immediately:', e.message);
  // => Stopped immediately: 404 Not Found
}
