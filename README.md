# backoff-util

A TypeScript utility library that provides configurable retry logic with backoff for any async function.

## Installation

```sh
# pnpm
pnpm add @aecomet/backoff-util

# npm
npm install @aecomet/backoff-util

# yarn
yarn add @aecomet/backoff-util
```

## Usage

### Default config

Retries up to **10 times** with exponential backoff (base delay `10ms`, max `1000ms`).

```js
import { Utility } from '@aecomet/backoff-util';

const utility = new Utility();
const result = await utility.backoff(async () => {
  return await fetchSomething();
});
```

### Custom options

```js
import { Utility } from '@aecomet/backoff-util';

const utility = new Utility({
  retryCount: 5,
  minDelay: 100,
  maxDelay: 2000,
  delay: 'linear'
});
const result = await utility.backoff(async () => {
  return await fetchSomething();
});
```

### `BackoffOptions`

| Option        | Type                                   | Default         | Description                                                    |
| ------------- | -------------------------------------- | --------------- | -------------------------------------------------------------- |
| `retryCount`  | `number`                               | `10`            | Maximum number of retry attempts                               |
| `minDelay`    | `number`                               | `10`            | Base delay value (ms) used in the backoff formula              |
| `maxDelay`    | `number`                               | `1000`          | Upper bound for the computed delay (ms)                        |
| `delay`       | `'exponential' \| 'linear' \| 'fixed'` | `'exponential'` | Delay calculation strategy, or a custom function               |
| `factor`      | `number`                               | `2`             | Multiplier for exponential delay (`minDelay * factor^attempt`) |
| `jitter`      | `'full' \| 'none'`                     | `'full'`        | Jitter strategy, or a custom function                          |
| `shouldRetry` | `(ctx: BackoffContext) => boolean`     | retry always    | Return `false` to stop retrying immediately                    |
| `onRetry`     | `(ctx: BackoffContext) => void`        | none            | Called on each retry for logging or side effects               |
| `timeoutMs`   | `number`                               | none            | Total elapsed time limit (ms); throws when exceeded            |
| `signal`      | `AbortSignal`                          | none            | Cancels the retry loop when the signal is aborted              |

### Advanced usage

```js
import { Utility } from '@aecomet/backoff-util';

const controller = new AbortController();

const utility = new Utility({
  retryCount: 5,
  minDelay: 100,
  maxDelay: 2000,
  delay: 'linear',
  factor: 3,
  jitter: 'none',
  shouldRetry: (ctx) => {
    return ctx.error instanceof Error && ctx.error.message.startsWith('5');
  },
  onRetry: (ctx) => {
    console.log(`Retry #${ctx.attempt}:`, ctx.error);
  },
  timeoutMs: 10000,
  signal: controller.signal
});

const result = await utility.backoff(async () => fetchSomething());
```

### Custom delay / jitter (DI)

You can inject custom functions for full control:

```js
import { Utility } from '@aecomet/backoff-util';

// Custom exponential delay
const utility = new Utility({
  delay: (ctx) => Math.min(100 * Math.pow(2, ctx.attempt), 5000),
  jitter: (delay) => delay * (0.5 + Math.random())
});
```

## `BackoffContext`

Callbacks receive a context object:

| Field       | Type                    | Description                                       |
| ----------- | ----------------------- | ------------------------------------------------- |
| `attempt`   | `number`                | Current attempt index (0-based)                   |
| `error`     | `unknown`               | The error that caused the retry                   |
| `elapsed`   | `number`                | Total elapsed time since the first call (ms)      |
| `remaining` | `number`                | Number of retries left (including current)        |
| `nextDelay` | `number` \| `undefined` | Next wait time in ms (undefined on final attempt) |

## OpenTelemetry integration

`onRetry` receives a `BackoffContext` with `attempt`, `remaining`, `nextDelay`, and `error`.
Use it to emit retry telemetry from your application's tracer:

```js
import { trace } from '@opentelemetry/api';
import { Utility } from '@aecomet/backoff-util';

const tracer = trace.getTracer('http-client');

const utility = new Utility({
  retryCount: 5,
  onRetry: (ctx) => {
    tracer.startActiveSpan('http.retry', (span) => {
      span.setAttribute('retry.attempt', ctx.attempt);
      span.setAttribute('retry.remaining', ctx.remaining);
      span.setAttribute('retry.next_delay_ms', ctx.nextDelay ?? 0);
      span.setAttribute('retry.elapsed_ms', ctx.elapsed);
      if (ctx.error instanceof Error) {
        span.recordException(ctx.error);
      }
      span.end();
    });
  }
});
```

## Examples

More example code is available in the [`example/`](./example/) directory.

```sh
pnpm build

node example/sample.mjs
node example/sampleWithConfig.mjs
node example/sampleWithAxios.mjs
node example/sampleWithShouldRetry.mjs
node example/sampleWithOnRetry.mjs
node example/sampleWithTimeout.mjs
node example/sampleWithStrategy.mjs
node example/sampleWithAbort.mjs
```

## For Developers

### Prerequisites

- Node.js `26.3.0` (see `.node-version`)
- pnpm `11`

```sh
# Build
pnpm build

# Run tests
pnpm test

# Run tests with UI
pnpm test -- --ui

# Link locally for testing in another project
pnpm link -g .
```

## Architecture

See [`docs/architecture.md`](./docs/architecture.md) for project structure and design details.

## Migration

If you are upgrading from v1, see the [migration guide](./docs/migrations/v1-to-v2.md).
