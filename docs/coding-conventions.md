# Coding Conventions

## Imports

### Path aliases

Use `@src/` alias for all internal imports. Do not use relative paths when referencing code within the project.

```ts
// Good
import { Utility } from '@src/utility';
import type { BackoffOptions } from '@src/types';

// Bad
import { Utility } from './utility';
import type { BackoffOptions } from '../types';
```

| Alias    | Maps to       |
| -------- | ------------- |
| `@src/`  | `src/`        |
| `@test/` | `__tests__/`  |

Aliases are configured in `tsconfig.json` (for `tsc`) and `vite.config.mts` / `__tests__/vitest.config.mts` (for build / test runner).

### Import order

1. External packages (`vitest`, `axios`, etc.)
2. Internal alias imports (`@src/...`, `@test/...`)
3. (No relative imports)

Separate groups with a blank line.

```ts
import { describe, expect, test } from 'vitest';
import { Utility } from '@src/utility';
```

## No comments

Do not add comments to source code. Code should be self-documenting through meaningful names and clear structure.

## TypeScript

- `strict` mode must always be enabled.
- Define types explicitly; avoid `any`.
- Use `import type` for type-only imports (erasable at runtime).
- Public API surface must have explicit type annotations; do not rely solely on inference.
- Avoid unnecessary type assertions (`as`).

## Public API

All exports visible to consumers must be re-exported from `src/index.ts`. Internal modules (`delay.ts`, `jitter.ts`, `types.ts`) are implementation details and should not be imported by consumers.

```ts
// src/index.ts — the sole public entry point
export { Utility } from '@src/utility';
export type { BackoffOptions } from '@src/types';
```

## Architecture pattern

- **Constructor injection**: Pass options via the constructor (`new Utility(options)`). No static factory methods.
- **Normalize at construction**: Convert string strategies to function form once, so the hot path has zero branching.
- **Immutable instances**: Do not mutate an instance after construction. Create a new instance for different behavior.

## Testing

- Follow the TDD cycle: RED (write failing test) → GREEN (minimum code) → REFACTOR (improve).
- One assertion per test is ideal. If multiple assertions are needed, document why in the test name.
- Do **not** use `useFakeTimers` (has unfixed bugs with this project's vitest setup). Use real (short) delays instead.
- Mock with `vi.fn()` and spy with `vi.spyOn()`.

## Formatting

Follow `.oxfmtrc.json`:

| Rule             | Value    |
| ---------------- | -------- |
| `printWidth`     | `120`    |
| `singleQuote`    | `true`   |
| `trailingComma`  | `none`   |
| `semi`           | `true`   |

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

| Type       | Usage                                  |
| ---------- | -------------------------------------- |
| `feat`     | New feature                            |
| `fix`      | Bug fix                                |
| `docs`     | Documentation changes only             |
| `refactor` | Code change with no behavior change    |
| `test`     | Adding or updating tests               |
| `chore`    | Build process, tooling, dependencies   |
| `ci`       | CI/CD configuration                    |

## Pre-commit workflow

Before every commit:

1. `pnpm format:check` — verify formatting (runs automatically via Lefthook)
2. `pnpm typecheck` — verify types
3. `pnpm test` — verify tests pass
4. `pnpm build` — verify build succeeds
