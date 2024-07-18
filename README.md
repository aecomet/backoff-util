# backoff-util

A utility to use retry any functions

## Getting Started

```
pnpm add @aecomet/backoff-util
```

## Examples

Example codes are [here](./example/)

### Node.js sample

```sh
pnpm build

node example/sample.mjs
# => Hello World

node example/sampleWithConfig.mjs
# => Hello World

node example/sampleWithAxios.mjs
# => { userId: 1, id: 1, title: 'delectus aut autem', completed: false }
```

### HTML sample

```sh
pnpm run dev:html
# then, you can access `http://localhost:5173/index.html`
```

## For Developers

```sh
# build
pnpm build

# test
pnpm test

# also, you can use ui
pnpm test -- --ui

# local package test
pnpm link -g .
```
