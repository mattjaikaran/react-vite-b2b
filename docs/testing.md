# Testing

Two separate suites; `bun run test` never runs the Playwright specs.

## Unit tests (Vitest)

- Configuration lives in `vite.config.ts` under `test`: `jsdom`, globals on,
  `src/test/setup.ts` loaded, and `src/**/*.{test,spec}.{ts,tsx}` collected.
- Tests sit next to the code they cover (`src/lib/utils.test.ts`,
  `src/pages/NotFoundPage.test.tsx`).
- Render through `src/test/test-utils.tsx`, which wraps the UI in a fresh
  `QueryClientProvider` and `BrowserRouter`; do not share a query client
  between tests.
- Run one file or one test with `bunx vitest run <path>` or
  `bunx vitest run -t "<name>"`; watch mode is `bun run test:watch`.

## End-to-end tests (Playwright)

- Configuration lives in `playwright.config.ts`; specs are `e2e/*.spec.ts`
  and `testDir` is `./e2e`.
- Install the browser once: `bunx playwright install chromium`.
- `bun run test:e2e` starts `bun run dev` on port 5173 (which regenerates the
  API client), reuses an existing local server, and exits with the test
  result. The HTML report is written to `playwright-report/` and never opened
  automatically.
- Locally the reporter is `html`; on CI it is `github`, with two retries,
  one worker, traces on the first retry, and screenshots on failure.
- `test:e2e:ui`, `test:e2e:headed`, and `test:e2e:debug` run the same specs
  with the interactive runner, a visible browser, or the inspector.

## What CI runs

`.github/workflows/ci.yml` runs, in order: `bun run typecheck`, `bun run
lint`, `bun run test`; then the Playwright suite on Ubuntu 24.04; then `bun
run build`. The agent-context gate (`bun run check-agents`) runs in the same
job as typecheck, lint, and unit tests.

Playwright 1.50.0 has no dependency list for Ubuntu 26.04, so the e2e job is
pinned to `ubuntu-24.04`.
