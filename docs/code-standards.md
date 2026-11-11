# Code standards

## TypeScript

- `strict`, `noUnusedLocals`, and `noUnusedParameters` are on; `bun typecheck`
  must pass.
- Import types with `import type`. Do not use `as any` or
  `@ts-ignore`/`@ts-expect-error`; fix the type instead.
- Use the `@/` alias for imports from `src/`, not long relative paths.
- No `console.log` in committed source; surface errors through the UI or
  throw.

## Components

- Components and pages use PascalCase files, named exports for new code, and
  props interfaces near the component. Existing default exports predate this
  rule.
- Keep a component file under 300 lines. Split into smaller components when it
  grows.
- `src/components/ui/` holds presentational primitives shared across pages;
  page-specific markup stays in `src/pages/`.
- Derive state during render (`useMemo`) instead of syncing it in
  `useEffect`.

## Data fetching

- All HTTP access goes through `src/lib/api.ts` and the generated client. Do
  not import axios or call `fetch` from a component or page.
- Put queries, mutations, cache keys, and invalidation in `src/lib/*` context
  modules or hooks (`src/lib/auth.tsx`, `src/lib/organizations.tsx`). Pages
  consume those hooks.
- Prefer the generated options and keys, e.g.
  `useQuery(organizationListOptions())` and
  `queryClient.invalidateQueries({ queryKey: organizationListQueryKey() })`.
- Navigate with `useNavigate()`. Do not assign `window.location.href`; the
  token-refresh interceptor in `src/lib/api.ts` is the one exception, because
  it runs outside React.
- Read API errors with `getErrorMessage(error)` and show them through
  `Alert`.

## Forms

- Pages manage form state with local `useState` and a typed submit handler;
  `Input` provides labels, hints, and error styling.
- The legacy `NO_USE_STATE_FOR_FORMS` convention check suggests
  react-hook-form, which is not a dependency. Treat that finding as advisory
  until a form library is added.

## Styling

- Use Tailwind utility classes. Reuse the shared classes in `src/index.css`
  (`btn`, `btn-primary`, `input`, `label`) and the `cn()` helper in
  `src/lib/utils.ts` when combining conditional classes.
- Follow the existing colour and spacing scale in `tailwind.config.js`.

## Generated code and dependencies

- Never edit `src/api/generated`; change the contract and run
  `bun api:generate`. `bun api:check` proves the contract still covers the
  client.
- Add every dependency to `DEPENDENCIES.md`;
  `bun run check-dependencies` fails otherwise.
- The convention checker (`bun run check-conventions`) lists deviations from
  these rules, including known legacy ones. Do not introduce new findings.
