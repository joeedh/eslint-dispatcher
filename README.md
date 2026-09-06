# @pathtx/eslint-dispatcher

A caching, parallel-batching wrapper around ESLint's flat config CLI. It walks a directory
itself, splits the matching files into size-bounded batches, runs `eslint --format json` on
each batch across a worker pool, and caches per-file results (content-addressed, keyed on
file content + config + ESLint version) so a re-run only re-lints what actually changed.

## Requirements

- Node.js with `pnpm` available on `PATH` (batches are run via `pnpm exec eslint`)
- A git repository — the cache root and target resolution are relative to
  `git rev-parse --show-toplevel`
- An `eslint.config.{js,mjs,ts,mts}` at the repo root

## Install

```sh
pnpm add -D @pathtx/eslint-dispatcher
```

## CLI usage

```sh
eslint-dispatcher [path] [...eslint args]
```

- `path` — file or directory to lint, defaults to `.`
- Any remaining arguments are forwarded to ESLint, with two exceptions handled by the
  dispatcher itself:
  - `--fix` — also bypasses the result cache for files that previously had errors
  - `--jobs` / `-j <n>` — number of batches to run concurrently (default `5`)
- `--format` / `-f` is stripped if passed — output is always requested as JSON internally so
  results can be cached and re-printed per file

```sh
eslint-dispatcher src --fix
eslint-dispatcher . --jobs 8
```

Exit code is `1` if any linted file (cached or fresh) has errors, `0` otherwise.

## Library usage

```ts
import { eslint, quickbuild } from '@pathtx/eslint-dispatcher';

await eslint.run('src', ['--fix']);

const mod = await quickbuild.quickBundle('./some-script.ts', []);
```

- `eslint.run(targetPath, rawEslintArgs)` — the same entry point the CLI calls
- `quickbuild.quickBundle(entryFile, otherFiles, options?, extraPrefix?)` — bundles and
  `import()`s a TypeScript/JS entry point on demand via esbuild, caching the build under
  `.quickbuild/`
- `quickbuild.quickBundleModule(moduleName, options?, returnDefault?)` — same, but for
  re-exporting an installed module through esbuild

## Caching

Both caches live under `<repo-root>/.eslintcache/`:

- `config/` — the resolved set of ignore globs from `eslint.config.*`, keyed by config file
  hash
- `results/` — per-file lint output, keyed by config hash, ESLint version, effective CLI
  args, file path, and file content

Result cache entries older than 14 days are pruned at the end of each run. Delete
`.eslintcache/` to force a full re-lint.

## Development

```sh
pnpm install
pnpm run lint        # lint this repo with itself
pnpm run typecheck   # tsc --noEmit
pnpm run build        # bundle bin/cli.ts + src/index.ts with esbuild, emit .d.ts files
pnpm run prettier     # format src/* and package.json
```

`pnpm run build` produces:

- `dist/cli.mjs`, `dist/index.mjs` — esbuild bundles (ESM, Node platform, source maps,
  `node_modules` dependencies left external)
- `dist/types/` — `.d.ts` declarations for both entry points, emitted by `tsc` via
  `tsconfig.build.json`
