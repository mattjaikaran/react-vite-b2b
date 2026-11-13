# AGENTS.md

Agent instructions for `react-vite-b2b`. This file is the single source of
agent guidance; the nearest `AGENTS.md` to the edited file wins. `CLAUDE.md`
is intentionally absent.

## Project overview

React 19 + Vite + TypeScript single-page app for a multi-tenant B2B product,
using TailwindCSS, TanStack Query, React Router, and a generated OpenAPI
client. The Django API lives in a separate repository; its contract is
vendored at `backend/docs/openapi/openapi.json`.

Stack, directory map, and data flow: [docs/architecture.md](docs/architecture.md).

## Commands

```bash
bun install          # Install dependencies (Bun is the only package manager)
bun dev              # Regenerate the API client, then start Vite on :5173
bun build            # Regenerate, typecheck, and build to dist/
bun lint             # Oxlint, warnings allowed
bun run lint:strict  # Oxlint, warnings are failures (the CI gate)
bun run format:check # Oxfmt check over the repository
bun typecheck        # Regenerate, then tsc --noEmit
bun run test         # Vitest unit suite
bun run test:e2e     # Playwright suite (install a browser first)
bun run api:check    # Verify the vendored contract still generates the client
bun run check-agents # AGENTS.md, link, secret, and generated-file gate
bun run doctor       # react-doctor, blocking on errors
bun run gauntlet     # Full chain; check-conventions is not clean yet
```

Prerequisites, every script, and the Playwright browser setup:
[docs/commands.md](docs/commands.md).

## Code standards and architecture

- Follow [docs/code-standards.md](docs/code-standards.md) for TypeScript,
  component, styling, and data-fetching rules.
- Keep data fetching and mutations in `src/lib/*` context modules and hooks;
  pages and components consume the hooks. Do not import axios or call `fetch`
  from a component.
- Read [docs/architecture.md](docs/architecture.md) before moving modules,
  changing the API boundary, or adding a provider.
- No ADRs exist yet. Record a durable architectural decision under
  `docs/adr/` and link it here and in `docs/README.md`.

## Testing policy

- Unit tests live beside the code as `src/**/*.test.ts(x)` and use Vitest.
  End-to-end tests live in `e2e/*.spec.ts` and use Playwright.
- Cross-component and user-visible behavior belongs in `e2e/`; keep unit
  tests for pure logic and isolated components.
- Run the suite that covers your change before you stop. Do not commit
  focused or skipped tests.
- Setup, isolation, and report locations: [docs/testing.md](docs/testing.md).

## Git and commits

- Conventional Commits: `type(scope): Imperative summary`, subject at most
  50 characters, no trailing period. Wrap the body at 72.
- Work on `agent/issue-<N>` branches for agent-run; never push to `main`.
- Commit explicit paths only, and leave the worktree clean.
- Do not amend or force-push a published commit.

## Spec workflow

Agent-run changes are driven by a spec:

- Write specs under `tasks/specs/` and list every file in `Files owned`.
  Change only those paths, plus a row you add when the work needs a new file.
- Acceptance criteria and verification commands are part of the spec. Run
  them, and report real output.
- Spec format and the gate: [tasks/specs/README.md](tasks/specs/README.md).

## Security

- Never commit secrets. Real `.env*` files stay untracked and `.env.example`
  documents the variables.
- Treat `src/api/generated`, dependencies, and the vendored contract as
  read-only inputs; regenerate instead of editing.
- `bun run check-agents` fails on a missing root `AGENTS.md`, a broken
  relative link in any `AGENTS.md`, a `CLAUDE.md` that is not `@AGENTS.md`,
  a tracked `.env*` file, or a tracked generated client. CI runs it.
- Document every dependency in [DEPENDENCIES.md](DEPENDENCIES.md);
  `bun run check-dependencies` enforces it.
