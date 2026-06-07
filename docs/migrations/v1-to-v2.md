# Migration Guide: v1 → v2

v2 introduces a DI-friendly constructor-based API. The old static factory pattern (`Utility.newWith*`) and `BackoffConfig` interface are removed.

## Quick diff

| Before | After |
|--------|-------|
| `BackoffConfig` | `BackoffOptions` |
| `Utility.newWithBackoff(config)` | `new Utility(options)` |
| `Utility.newWithDefaultBackoff()` | `new Utility()` |
| `utility.withBackoff(fn)` | `utility.backoff(fn)` |

## Step-by-step

### 1. Instantiation

```diff
- import { Utility, type BackoffConfig } from '@aecomet/backoff-util';
+ import { Utility, type BackoffOptions } from '@aecomet/backoff-util';

- const config: BackoffConfig = { retryCount: 5 };
- const utility = Utility.newWithBackoff(config);
+ const options: BackoffOptions = { retryCount: 5 };
+ const utility = new Utility(options);
```

### 2. Default config

```diff
- const utility = Utility.newWithDefaultBackoff();
+ const utility = new Utility();
```

### 3. Calling backoff

```diff
- const result = await utility.withBackoff(async () => fetchSomething());
+ const result = await utility.backoff(async () => fetchSomething());
```

### 4. Inline usage (no variable)

```diff
- const result = await Utility.newWithBackoff({ retryCount: 3 }).withBackoff(fn);
+ const result = await new Utility({ retryCount: 3 }).backoff(fn);
```

### 5. Type imports

```diff
- import type { BackoffConfig } from '@aecomet/backoff-util';
+ import type { BackoffOptions } from '@aecomet/backoff-util';
```

## Why?

- **Constructor injection** makes it easy to pass `options` directly or through a DI container.
- Instance methods (`backoff`) read more naturally than static factories (`newWithBackoff`).
- Fewer exports = simpler public API surface.
