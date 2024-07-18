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
```

## HTML sample

```sh
pnpm run dev:html
# then, you can access `http://localhost:5173/index.html`
```
