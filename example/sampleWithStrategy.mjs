/**
 * strategy example
 *
 * Demonstrates exponential, linear, and fixed backoff strategies.
 */
import { Utility } from '@aecomet/backoff-util';

async function runWithStrategy(strategy) {
  let attempt = 0;
  const utility = new Utility({ retryCount: 5, minDelay: 20, maxDelay: 200, delay: strategy });

  const start = Date.now();
  const result = await utility.backoff(async () => {
    attempt++;
    if (attempt < 3) throw new Error('transient');
    return `ok`;
  });
  const elapsed = Date.now() - start;
  console.log(`strategy=${strategy} | result=${result} | elapsed=${elapsed}ms`);
}

await runWithStrategy('exponential');
await runWithStrategy('linear');
await runWithStrategy('fixed');
