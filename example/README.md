# Sample Usage

## Node.js sample

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

## HTML sample

```sh
pnpm run dev:html
# then, you can access `http://localhost:5173/index.html`
```
