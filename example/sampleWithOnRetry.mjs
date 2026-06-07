/**
 * onRetry example
 *
 * Adds a custom retry hook via DI.
 */
import { Utility } from '@aecomet/backoff-util';

let attempt = 0;

const utility = new Utility({
  retryCount: 5,
  minDelay: 10,
  maxDelay: 500,
  onRetry: (ctx) => {
    console.log(`[onRetry] attempt=${ctx.attempt} error="${ctx.error.message}"`);
  }
});

const result = await utility.backoff(async () => {
  attempt++;
  if (attempt < 3) throw new Error('transient error');
  return `Succeeded after ${attempt} attempts`;
});

console.log(result);
// [onRetry] attempt=0 error="transient error"
// [onRetry] attempt=1 error="transient error"
// => Succeeded after 3 attempts
