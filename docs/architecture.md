# Architecture

## Overview

`@aecomet/backoff-util` is a zero-dependency TypeScript utility library that provides exponential backoff retry logic for any async function. It is distributed as both ESM and UMD modules.

## Tech Stack

| Category       | Tool / Library         | Version |
| -------------- | ---------------------- | ------- |
| Language       | TypeScript             | ^5.x    |
| Build          | Vite + vite-plugin-dts | ^8.x    |
| Test           | Vitest                 | ^4.x    |
| Package manager| pnpm                   | 10      |
| CI             | GitHub Actions         | —       |
| Lint (commit)  | commitlint (Docker)    | —       |

## Directory Structure

```
backoff-util/
├── src/                        # Library source
│   ├── index.ts                # Public API entry point
│   ├── lib/
│   │   ├── BackoffConfig.ts    # Retry configuration
│   │   └── Utility.ts          # Backoff execution logic
│   └── types/
│       └── ErrorCallback.ts    # Shared type definitions
├── __tests__/
│   ├── index.test.ts           # Integration tests
│   ├── vitest.config.mts       # Vitest configuration
│   └── tsconfig.json           # TypeScript config for tests
├── example/                    # Usage examples
│   ├── sample.mjs              # Default config example
│   ├── sampleWithConfig.mjs    # Custom config example
│   ├── sampleWithAxios.mjs     # HTTP retry example (axios)
│   └── html/                   # Browser example (Vite dev server)
├── dist/                       # Build output (generated)
│   ├── index.mjs               # ESM bundle
│   ├── index.umd.cjs           # UMD bundle (CommonJS)
│   └── index.d.ts              # Type declarations
├── docs/
│   └── architecture.md         # This file
├── .github/
│   ├── copilot-instructions.md
│   ├── dependabot.yml
│   └── workflows/
│       ├── test-runner.yml     # Runs tests on pull requests
│       └── lint-runner.yml     # Runs commitlint on pull requests
├── vite.config.mts             # Vite library build configuration
├── tsconfig.json               # Root TypeScript configuration
├── prettier.config.js          # Prettier formatting rules
├── pnpm-lock.yaml
└── package.json
```

## Core Classes

### `BackoffConfig`

Holds the retry configuration. All setters return `this` for method chaining.

| Property     | Type     | Default (newWithDefault) | Description                              |
| ------------ | -------- | ------------------------ | ---------------------------------------- |
| `retryCount` | `number` | `10`                     | Maximum number of retry attempts         |
| `minDelay`   | `number` | `10`                     | Base delay value used in backoff formula |
| `maxDelay`   | `number` | `1000`                   | Upper bound for the computed delay (ms)  |

### `Utility`

The main class. Instantiated via static factory methods; the constructor is private.

| Method                             | Description                                        |
| ---------------------------------- | -------------------------------------------------- |
| `Utility.newWithDefault()`         | Creates an instance with default `BackoffConfig`   |
| `Utility.newWithConfig(config)`    | Creates an instance with a custom `BackoffConfig`  |
| `backoff(callback: () => {})`      | Executes the callback with exponential backoff     |

## Backoff Algorithm

On each failed attempt, the sleep duration is calculated as follows:

```
estimatedTime = minDelay ^ retryCount
backoff       = min(estimatedTime, maxDelay)
sleep         = backoff + random(1, 10)   // jitter: 1–10 ms
```

The random jitter prevents thundering-herd issues when multiple clients retry simultaneously. If the callback still fails after `retryCount` attempts, an error is thrown.

## Build Output

Vite is configured in library mode (`vite.config.mts`) with `vite-plugin-dts` to emit type declarations.

| File                  | Format | Usage                  |
| --------------------- | ------ | ---------------------- |
| `dist/index.mjs`      | ESM    | `import` (bundlers)    |
| `dist/index.umd.cjs`  | UMD    | `require` (CommonJS)   |
| `dist/index.d.ts`     | —      | TypeScript types       |

## CI / CD

Both workflows are triggered on pull requests.

- **test-runner.yml** — installs dependencies and runs `pnpm test` on `ubuntu-latest`.
- **lint-runner.yml** — runs commitlint inside a pre-built Docker image (`ghcr.io/aecomet/commitlint-base`) to validate commit messages against the Conventional Commits specification.
