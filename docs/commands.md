# Command reference

Run every command from the repository root with Bun 1.x installed. The
Playwright suite also needs a browser (below).

## Setup

```bash
bun install --frozen-lockfile   # Clean checkout / CI
bun install                     # Local development
```

The vendored contract at `backend/docs/openapi/openapi.json` means no backend
is required to generate the client, typecheck, or build before the API
exists.

## Develop, build, preview

```bash
bun dev       # Regenerate the API client, then Vite on http://localhost:5173
bun build     # Regenerate, typecheck, and write dist/
bun preview   # Serve the built dist/ locally
```

`bun dev` proxies `/api` to `http://localhost:8000` and runs until stopped.
`bun build` and `bun typecheck` also regenerate `src/api/generated` first.

## Quality gates

```bash
bun lint              # ESLint over TS/TSX, zero warnings allowed
bun typecheck         # api:generate, then tsc --noEmit
bun run test          # Vitest unit suite (src/**/*.test.ts(x))
bun run test:watch    # Vitest in watch mode
bun run test:coverage # Vitest with coverage
bun run check-agents  # AGENTS.md, link, secret, skill, and generated-file gate
bun run check-conventions  # Legacy convention report (see note)
bun run check-dependencies # Every package.json dependency is in DEPENDENCIES.md
```

`check-conventions` currently reports known deviations in the existing tree
(window redirect in `src/lib/api.ts`, default exports, and form-state usage),
so it is advisory and not part of CI. Do not add new findings.

`bun run test:coverage` needs `@vitest/coverage-v8`, which is not a
dependency, so it fails in a clean checkout until that package is added.

`bun run gauntlet` chains `api:check`, `lint`, `typecheck`, `test`,
`check-conventions`, `check-dependencies`, and `check-agents`. Because the
convention report is not clean yet, run the individual gates when you need a
passing signal.

## API client

```bash
bun run api:generate   # Rewrite src/api/generated from the contract
bun run api:check      # Generate to a scratch directory and verify coverage
```

`OPENAPI_INPUT=../backend/docs/openapi/openapi.json bun run api:generate`
points the generator at an exported contract in a monorepo. Never edit
`src/api/generated`; it is git-ignored.

## End-to-end tests

```bash
bunx playwright install chromium
bun run test:e2e          # Headless Chromium; exits with the result
bun run test:e2e:ui       # Interactive runner
bun run test:e2e:headed   # Visible browser
bun run test:e2e:debug    # Inspector
```

The suite starts `bun run dev` on port 5173 when no server is running and
writes `playwright-report/`. See [Testing](testing.md).

## Other

```bash
bun run format   # Prettier over src/**/*.{ts,tsx,css}
bun run doctor   # react-doctor scan (downloads the tool with npx)
```
