# Specs

Specs drive agent-run changes. A spec is a Markdown file in this directory
named for its issue or slug, for example `012-agent-docs.md`.

## Required sections

- **Goal** — the one behavior or state the change produces.
- **Files owned** — every repository path the change may edit. Add a row
  before adding a new file; an unowned path is out of scope.
- **Requirements** — observable behavior, not implementation steps.
- **Acceptance criteria** — checkable outcomes.
- **Verification** — the exact commands that prove the change, using the
  repository's own scripts.

## Gate

- Change only the `Files owned` paths. Do not widen scope to nearby cleanup.
- Run every command in `Verification` and the repository checks that cover
  the changed files (`bun lint`, `bun typecheck`, `bun build`,
  `bun run check-agents`, plus `bun run test:e2e` for user-visible flows).
- Report real command output; never claim a check that did not run.
- A spec that needs a test adds or extends a Playwright spec under `e2e/` or
  a backend smoke test; unit tests are not changed by agent-run work.
- Commit with a Conventional Commit subject and leave the worktree clean.

Agent-facing rules live in [AGENTS.md](../../AGENTS.md); command details live
in [docs/commands.md](../../docs/commands.md).
