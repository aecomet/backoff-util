# backoff-util

A TypeScript utility library that provides exponential backoff retry logic for any async function.

## Installation

```sh
pnpm add @aecomet/backoff-util
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

| Parameter    | Type     | Description                                     |
| ------------ | -------- | ----------------------------------------------- |
| `retryCount` | `number` | Maximum number of retry attempts                |
| `minDelay`   | `number` | Base value (ms) used in the backoff formula     |
| `maxDelay`   | `number` | Upper bound (ms) for the computed sleep time    |

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
