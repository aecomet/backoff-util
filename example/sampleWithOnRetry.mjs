/**
 * onRetry example
 *
 * Replaces the built-in console.warn with a custom retry hook.
 */
import { BackoffConfig, Utility } from '@aecomet/backoff-util';

let attempt = 0;

const config = new BackoffConfig(5, 10, 500).setOnRetry((error, i) => {
  console.log(`[onRetry] attempt=${i} error="${error.message}"`);
});

const utility = Utility.newWithConfig(config);

const result = await utility.backoff(async () => {
  attempt++;
  if (attempt < 3) throw new Error('transient error');
  return `Succeeded after ${attempt} attempts`;
});

console.log(result);
// [onRetry] attempt=0 error="transient error"
// [onRetry] attempt=1 error="transient error"
// => Succeeded after 3 attempts
