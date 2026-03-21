/**
 * strategy example
 *
 * Demonstrates exponential, linear, and fixed backoff strategies.
 */
import { BackoffConfig, Utility } from '@aecomet/backoff-util';

async function runWithStrategy(strategy) {
  let attempt = 0;
  const config = new BackoffConfig(5, 20, 200).setStrategy(strategy);
  const utility = Utility.newWithConfig(config);

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
