# Architecture

## Stack

- React 19 with TypeScript, bundled by Vite.
- TailwindCSS for styling, with shared utility classes in `src/index.css`.
- TanStack Query for server state.
- React Router for client-side routing.
- A generated OpenAPI client (`@hey-api/openapi-ts`) wrapping a shared axios
  instance.
- Vitest and Playwright for tests.

## Directory map

```text
src/
├── api/
│   ├── generated/          # Generated client; git-ignored build artifact
│   └── runtime-config.ts   # Gives the generated client the shared axios instance
├── components/
│   ├── ui/                 # Presentational primitives (Button, Input, Card, ...)
│   ├── Layout.tsx          # Navigation shell and auth-aware menu
│   ├── OrgSwitcher.tsx     # Organization switching dropdown
│   └── ProtectedRoute.tsx  # Authentication guard for private routes
├── lib/
│   ├── api.ts              # Axios instance, token storage, interceptors, errors
│   ├── auth.tsx            # AuthProvider/useAuth
│   ├── organizations.tsx   # OrganizationProvider and org/team/member hooks
│   └── utils.ts            # Class-name helpers
├── pages/                  # Route components
├── test/                   # Vitest setup and render helpers
├── App.tsx                 # Route table
├── main.tsx                # QueryClientProvider, BrowserRouter, entry point
└── index.css               # Tailwind layers and utility classes
backend/docs/openapi/openapi.json  # Vendored contract for standalone builds
e2e/                                # Playwright specs
scripts/                            # API generation/checking and repository gates
```

The `@/*` path alias maps to `src/*` (`tsconfig.json` and `vite.config.ts`).

## Runtime shape

`src/main.tsx` creates one `QueryClient` and mounts
`QueryClientProvider` → `BrowserRouter` → `App`. `App` nests `AuthProvider` →
`OrganizationProvider` → the route table. `Layout` renders the navigation and
an `Outlet`; private routes sit under `ProtectedRoute`.

`AuthProvider` owns the current user (`authGetCurrentUserOptions`), login and
registration mutations, and token storage. `OrganizationProvider` owns the
organization list, the selected organization (persisted under
`current_organization_id`), and the org-scoped team/member/organization
mutations. Both expose hooks; pages do not fetch directly.

## API boundary

`src/lib/api.ts` is the only axios instance. It:

- reads `VITE_API_URL` (an origin without `/api`; empty in development),
- adds the `Authorization: Bearer` header from `localStorage`,
- refreshes an expired access token through `/api/auth/refresh`, retries the
  original request once, and clears tokens on failure.

`src/api/runtime-config.ts` hands that instance to the generated client, so
every SDK call inherits the interceptors and base URL. Generated paths already
include the `/api` prefix. In development, Vite proxies `/api` to
`http://localhost:8000`; production sets `VITE_API_URL` to the API origin.

## Generated client

`bun api:generate` reads `backend/docs/openapi/openapi.json` (override with
`OPENAPI_INPUT`) and writes `src/api/generated`:

- `types.gen.ts` — request and response types,
- `sdk.gen.ts` — typed SDK functions,
- `zod.gen.ts` — request, response, and definition schemas,
- `client.gen.ts` — client configuration,
- `@tanstack/react-query.gen.ts` — query keys, options, and mutations.

`bun dev`, `bun build`, and `bun typecheck` regenerate the client first, so a
fresh checkout builds before the backend exists. `bun api:check` generates
into a scratch directory and verifies every contract operation is covered
without touching `src/api/generated`.

## Conventions and gates

`bun lint`, `bun typecheck`, `bun run check-agents`, and
`bun run check-dependencies` are the CI gates. `bun run gauntlet` runs the
local combination, including the unit suite. See
[Command reference](commands.md).
