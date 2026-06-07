# Agents Guide for backoff-util

## Tech Stack

- **Runtime**: Node.js 26.3.0
- **Language**: TypeScript (strict mode)
- **Package manager**: pnpm
- **Build**: Vite
- **Test**: Vitest
- **Formatter**: Prettier (`printWidth: 120`, `singleQuote: true`, `trailingComma: none`)
- **Git hooks**: Lefthook (pre-commit: format check, pre-push: AI review)

## Reference Documents (read before working)

| File                              | Purpose                                                      |
| --------------------------------- | ------------------------------------------------------------ |
| `.github/copilot-instructions.md` | Coding conventions, commit workflow, review checklist        |
| `docs/architecture.md`            | Project structure, public API, build output                  |
| `docs/coding-conventions.md`      | Import rules, TypeScript style, testing & commit conventions |
| `.agent/tdd/SKILL.md`             | TDD workflow — always follow when writing code               |
| `README.md`                       | Usage examples, options reference                            |

## Skills Available

| Skill | File                  | When to use                           |
| ----- | --------------------- | ------------------------------------- |
| `tdd` | `.agent/tdd/SKILL.md` | When writing or modifying source code |

## Key Commands

```sh
pnpm test        # Run all tests
pnpm build       # Build to dist/
pnpm format:check  # Check formatting
pnpm format      # Auto-format
```

## Rules

- All code changes must follow the TDD cycle (RED → GREEN → REFACTOR).
- Always run `pnpm test` and `pnpm build` before committing.
- Commit messages must follow Conventional Commits.
- Public API is exported from `src/index.ts` only.
- Use `@src/` path alias when importing within source and test files.
