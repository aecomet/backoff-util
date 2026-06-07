---
applyTo: '**'
---

## Response

- Always respond in Japanese.

## Project Overview

- TypeScript utility library (`@aecomet/backoff-util`)
- Build tool: Vite
- Test framework: Vitest
- Package manager: pnpm
- Source code: `src/`
- Tests: `__tests__/`
- Build output: `dist/` (UMD / ESM / type declarations)

## Coding Conventions

- Use meaningful names for variables and functions.
- Keep comments concise and specific.
- Avoid magic numbers; define them as named constants.
- Prioritize code readability.

### TypeScript

- Keep `strict` mode enabled at all times.
- Define types explicitly; avoid `any`.
- Use path aliases `@src/*` and `@test/*` where applicable.
- All public API must be exported from `src/index.ts`.

### Prettier

Follow the project's `prettier.config.js`:

- `printWidth`: 120
- `singleQuote`: true
- `trailingComma`: none
- `semi`: true

## Code Review

Always perform a code review before committing. **Before running `git commit`, verify that every item in the checklist below is satisfied. Do not skip this step regardless of how small the change is.**

### Commit Workflow

Always follow this order — never skip a step:

1. Stage changes: `git add`
2. Review staged diff: `git --no-pager diff --staged`
3. Confirm every item in the checklist below is satisfied
4. Run tests: `pnpm test`
5. Review and update `docs/architecture.md` if the project structure or tech stack has changed
6. Review and update `README.md` if setup instructions or feature descriptions are outdated
7. Run `git commit`

### Review Checklist

#### TypeScript

- No `strict` mode violations.
- Public API surface has explicit type annotations; do not rely solely on inference.
- Avoid unnecessary type assertions (`as`).

### Test Verification

Confirm all tests pass before committing:

```sh
pnpm test
```

### Build Verification

Confirm the build completes successfully before committing:

```sh
pnpm build
```

## Git Commits

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                                               |
| ---------- | --------------------------------------------------------- |
| `feat`     | A new feature                                             |
| `fix`      | A bug fix                                                 |
| `docs`     | Documentation changes only                                |
| `style`    | Code style changes (formatting, missing semicolons, etc.) |
| `refactor` | Code changes that neither fix a bug nor add a feature     |
| `perf`     | Performance improvements                                  |
| `test`     | Adding or updating tests                                  |
| `chore`    | Changes to build process, tooling, or dependencies        |
| `ci`       | Changes to CI/CD configuration                            |
| `revert`   | Reverting a previous commit                               |

### Examples

```
feat(backoff): add jitter option to BackoffConfig
fix(utility): handle zero delay edge case
docs: update README with usage examples
chore(deps): upgrade vitest to v4
```

## Pre-commit Workflow

Lefthook is configured to run automatically:
- `pre-commit`: Runs `pnpm format:check` and (if available) `pnpm lint`
- `pre-push`: Reviews staged changes via `scripts/review-diff.sh`

Before committing, ensure:
1. Stage your changes (`git add`)
2. Lefthook will auto-verify formatting and lint
3. If hooks fail, fix issues and try again

### Package Updates

- Use `npx npm-check-updates -u` to update all packages to latest versions
- Then run `CI=true pnpm install --no-frozen-lockfile` to update lockfile
- Verify with `pnpm build` after updates
