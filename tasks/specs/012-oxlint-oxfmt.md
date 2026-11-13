# Switch to oxlint and oxfmt and align CI

## Goal

The repository lints with Oxlint, formats with Oxfmt, runs React doctor from
the pinned dev dependency, and has a CI that matches the shared boilerplate
job set.

## Files owned

- `.github/workflows/ci.yml`
- `.eslintrc.cjs` (deleted)
- `.prettierignore` (deleted)
- `.oxlintrc.json` (new)
- `.oxfmtrc.json` (new)
- `AGENTS.md`
- `DEPENDENCIES.md`
- `README.md`
- `bun.lock`
- `docs/architecture.md`
- `docs/commands.md`
- `docs/testing.md`
- `e2e/organizations.spec.ts` (formatter only)
- `index.html`
- `openapi-ts.config.ts`
- `package.json`
- `scripts/api-check.ts`
- `scripts/api-generate.ts`
- `scripts/check_agents.ts`
- `scripts/check_conventions.ts`
- `scripts/check_dependencies.ts`
- `src/api/runtime-config.ts`
- `src/components/OrgSwitcher.tsx`
- `src/components/ui/Alert.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Image.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Spinner.tsx`
- `src/components/ui/index.ts`
- `src/lib/organizations.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/ProfilePage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/TeamPage.tsx`
- `tasks/specs/012-oxlint-oxfmt.md` (new)
- `tailwind.config.js`

## Requirements

- `package.json` exposes `lint`, `lint:strict`, `lint:fix`, `format`, and
  `format:check` with the shared toolchain commands, and `doctor` runs the
  pinned `react-doctor` binary instead of `npx react-doctor@latest`.
- ESLint and Prettier are gone: no ESLint or Prettier configuration files and
  no ESLint or Prettier dependencies.
- `.oxlintrc.json` and `.oxfmtrc.json` carry the boilerplate settings and
  ignore the generated client, build output, reports, the lockfile, and the
  vendored contract.
- Every tracked file the formatter owns is formatted, so `format:check`
  passes.
- CI runs the Oxlint (`lint:strict`), Oxfmt (`format:check`), typecheck,
  unit test, React doctor (`doctor`), agent-docs, dependency, Playwright, and
  build jobs, each after `bun install --frozen-lockfile`.
- The docs describe the new commands, gates, and CI jobs, and
  `DEPENDENCIES.md` lists the toolchain.

## Acceptance criteria

- `bun run lint:strict` exits 0.
- `bun run format:check` exits 0.
- `bun run typecheck` exits 0.
- `bun run doctor` exits 0.
- `bun run build`, `bun run api:check`, `bun run check-agents`, and
  `bun run check-dependencies` exit 0.
- `bun install --frozen-lockfile` accepts the lockfile.

## Verification

```bash
bun install --frozen-lockfile
bun run lint:strict
bun run format:check
bun run typecheck
bun run doctor
bun run build
bun run api:check
bun run check-agents
bun run check-dependencies
```
