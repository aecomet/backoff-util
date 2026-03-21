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

### With default config

Retries up to **10 times** with a base delay of `10 ms` and a max delay cap of `1000 ms`.

```js
import { Utility } from '@aecomet/backoff-util';

const utility = Utility.newWithDefault();
const result = await utility.backoff(async () => {
  // any function that may throw
  return await fetchSomething();
});
```

### With custom config

```js
import { BackoffConfig, Utility } from '@aecomet/backoff-util';

const config = new BackoffConfig(5, 100, 2000);
// retryCount=5, minDelay=100ms, maxDelay=2000ms

const utility = Utility.newWithConfig(config);
const result = await utility.backoff(async () => {
  return await fetchSomething();
});
```

### `BackoffConfig` options

| Parameter     | Type                                           | Default        | Description                                          |
| ------------- | ---------------------------------------------- | -------------- | ---------------------------------------------------- |
| `retryCount`  | `number`                                       | —              | Maximum number of retry attempts                     |
| `minDelay`    | `number`                                       | —              | Base delay value (ms) used in the backoff formula    |
| `maxDelay`    | `number`                                       | —              | Upper bound for the computed delay (ms)              |
| `shouldRetry` | `(error: unknown, attempt: number) => boolean` | retry always   | Return `false` to stop retrying immediately          |
| `onRetry`     | `(error: unknown, attempt: number) => void`    | `console.warn` | Called on each retry for logging or side effects     |
| `timeoutMs`   | `number`                                       | none           | Total elapsed time limit (ms); throws when exceeded  |
| `strategy`    | `'exponential' \| 'linear' \| 'fixed'`        | `exponential`  | Delay calculation strategy                           |
| `signal`      | `AbortSignal`                                  | none           | Cancels the retry loop when the signal is aborted    |

### Advanced usage

```ts
import { BackoffConfig, Utility } from '@aecomet/backoff-util';

const controller = new AbortController();

const config = new BackoffConfig(5, 100, 2000)
  .setStrategy('linear')
  .setShouldRetry((error, attempt) => {
    // only retry on 5xx errors
    return error instanceof Error && error.message.startsWith('5');
  })
  .setOnRetry((error, attempt) => {
    console.log(`Retry #${attempt}:`, error);
  })
  .setTimeoutMs(10000)
  .setSignal(controller.signal);

const utility = Utility.newWithConfig(config);
const result = await utility.backoff(async () => fetchSomething());
```

## Examples

More example code is available in the [`example/`](./example/) directory.

### Run Node.js examples

```sh
pnpm build

node example/sample.mjs
# => Hello World

node example/sampleWithConfig.mjs
# => Hello World

node example/sampleWithAxios.mjs
# => { userId: 1, id: 1, title: 'delectus aut autem', completed: false }

node example/sampleWithShouldRetry.mjs
# => Succeeded after 3 attempts
# => Stopped immediately: 404 Not Found

node example/sampleWithOnRetry.mjs
# [onRetry] attempt=0 error="transient error"
# [onRetry] attempt=1 error="transient error"
# => Succeeded after 3 attempts

node example/sampleWithTimeout.mjs
# => Caught: Backoff timed out: total elapsed time exceeded the limit.

node example/sampleWithStrategy.mjs
# => strategy=exponential | result=ok | elapsed=...ms
# => strategy=linear      | result=ok | elapsed=...ms
# => strategy=fixed       | result=ok | elapsed=...ms

node example/sampleWithAbort.mjs
# => Aborting...
# => Caught: Backoff aborted.
```

### Run browser example

```sh
pnpm run dev:html
# Open http://localhost:5173/index.html
```

## For Developers

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
