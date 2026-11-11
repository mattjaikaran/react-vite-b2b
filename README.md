# React Vite B2B

A modern React B2B starter template with multi-tenant organization support, built with Vite, TailwindCSS, TanStack Query, and TypeScript.

## Features

- **React 18** - Latest React with concurrent features
- **Vite** - Lightning fast HMR and optimized builds
- **TypeScript** - Full type safety
- **TailwindCSS** - Utility-first CSS framework
- **TanStack Query** - Powerful data fetching and caching
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **OpenAPI client** - Generated types, SDK, Zod schemas, and TanStack Query hooks from the backend contract with `@hey-api/openapi-ts`
- **Zod** - Schema validation
- **ESLint + Prettier** - Code linting and formatting
- **Bun** - Fast JavaScript runtime and package manager
- **Multi-tenancy** - Organization switching and context
- **B2B Components** - Organization switcher, team management UI

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/react-vite-b2b.git myapp
cd myapp
```

2. Install dependencies:
```bash
bun install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
bun dev
```

Visit http://localhost:5173

## Project Structure

```
src/
├── api/
│   ├── generated/           # Generated OpenAPI client (git-ignored build artifact)
│   └── runtime-config.ts    # Passes the shared axios instance to the client
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Alert.tsx        # Alert/notification component
│   │   ├── Badge.tsx        # Status badges
│   │   ├── Button.tsx       # Button with variants
│   │   ├── Card.tsx         # Card container components
│   │   ├── Input.tsx        # Form input with validation
│   │   ├── Spinner.tsx      # Loading spinner
│   │   └── index.ts         # Component exports
│   ├── nav/                 # Navigation components
│   ├── Layout.tsx           # Main layout with navigation
│   ├── OrgSwitcher.tsx      # Organization switching dropdown
│   └── ProtectedRoute.tsx
├── lib/
│   ├── api.ts               # Axios instance and helpers
│   ├── auth.tsx             # Authentication context
│   ├── organizations.tsx    # Organization context
│   └── utils.ts             # Utility functions
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProfilePage.tsx
│   ├── OrganizationsPage.tsx
│   ├── TeamPage.tsx
│   └── NotFoundPage.tsx
├── test/
│   ├── setup.ts             # Vitest setup
│   └── test-utils.tsx       # Test utilities
├── types/                   # TypeScript type definitions
├── App.tsx                  # Main app component
├── main.tsx                 # Entry point
└── index.css                # Global styles with Tailwind
```

## Scripts

```bash
bun dev        # Start development server
bun build      # Build for production
bun preview    # Preview production build
bun lint       # Run ESLint
bun format     # Format with Prettier
bun typecheck  # Run TypeScript check
bun run test   # Run tests
bun api:generate  # Regenerate the OpenAPI client
bun api:check     # Check the vendored contract still generates the client
```

## API Integration

The template is configured to work with a Django B2B API backend (like [django-api-b2b](https://github.com/yourusername/django-api-b2b)).

### Generated API Client

`@hey-api/openapi-ts` generates the client from the backend's OpenAPI contract into `src/api/generated`:

- `types.gen.ts` - request and response types
- `sdk.gen.ts` - typed SDK functions
- `zod.gen.ts` - Zod request, response, and definition schemas
- `@tanstack/react-query.gen.ts` - query keys, query options, and mutation options

A vendored copy of the paired backend contract lives at `backend/docs/openapi/openapi.json`, so a fresh checkout builds and typechecks before the backend exists. `src/api/generated` is a build artifact and is not committed: `bun dev`, `bun build`, and `bun typecheck` regenerate it first. To regenerate or validate it yourself:

```bash
bun api:generate  # Rewrite src/api/generated
bun api:check     # Check the contract still generates every operation
```

In a mattstack monorepo, point the generator at the exported backend contract:

```bash
OPENAPI_INPUT=../backend/docs/openapi/openapi.json bun api:generate
```

Do not edit `src/api/generated`; change the contract and regenerate. The generated client receives the shared axios instance from `src/api/runtime-config.ts`, so the auth and token-refresh interceptors apply to every SDK call.

### Development Proxy

In development, API requests to `/api/*` are proxied to `http://localhost:8000` (see `vite.config.ts`). Generated paths already include the `/api` prefix.

### Production

Set the `VITE_API_URL` environment variable to your API origin, without the `/api` path:

```env
VITE_API_URL=https://api.example.com
```

Requests go to `https://api.example.com/api/*`.

> Upgrading from an older checkout: `VITE_API_URL` used to include `/api` because the
> handwritten requests did not. Generated paths now carry the prefix, so remove the
> trailing `/api` from deployments that set it; otherwise requests go to
> `https://api.example.com/api/api/*`.

## Authentication

The template includes a complete authentication flow:

- Login with email/password
- User registration
- JWT token management with auto-refresh
- Protected routes
- Auth context with `useAuth()` hook

## Multi-tenancy

### Organization creation

Open `/organizations?create=1` to show the existing creation form.
The organization switcher uses this URL from both its empty state and
its menu. Close the form to remove the query parameter. Do not link to
`/organizations/new` or an organization settings page; this template does
not register those routes.

Keep this React Router source distinct from mattstack's TanStack Router
source mapping. Do not substitute it silently for the mapped frontend.

### Organization Context

Use the organization context to manage the current organization:

```typescript
import { useOrganization } from '@/lib/organizations'

function MyComponent() {
  const { currentOrg, organizations, switchOrg } = useOrganization()

  return (
    <div>
      <p>Current: {currentOrg?.name}</p>
      <select onChange={(e) => switchOrg(e.target.value)}>
        {organizations.map(org => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
    </div>
  )
}
```

### API Requests with Organization Context

The API client automatically includes the organization ID in requests:

```typescript
import { teamList } from '@/api/generated/sdk.gen'

const { data: teams } = await teamList({ path: { org_id: currentOrg.id } })
```

## UI Components

The template includes a set of reusable UI components in `src/components/ui/`:

```typescript
import { Button, Input, Card, Alert, Badge, Spinner } from '@/components/ui'

// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Danger</Button>
<Button loading>Loading...</Button>

// Input with validation
<Input label="Email" error="Invalid email" helperText="We'll never share your email" />

// Card components
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Card content goes here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>

// Alert variants
<Alert variant="success" title="Success!">Operation completed.</Alert>
<Alert variant="error" dismissible onDismiss={() => {}}>Something went wrong.</Alert>

// Badge for roles
<Badge variant="success">Owner</Badge>
<Badge variant="primary">Admin</Badge>
<Badge variant="default">Member</Badge>

// Loading spinner
<Spinner size="lg" />
```

## Styling

Uses TailwindCSS with custom utility classes defined in `src/index.css`:

- `.btn` - Base button styles
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-outline` - Outlined button
- `.input` - Form input styles
- `.label` - Form label styles

## Customization

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route in `src/App.tsx`

### Adding API Endpoints

Add the operation to the backend contract, regenerate the client, and use the generated query or mutation options:

```typescript
import { useQuery } from '@tanstack/react-query'
import { teamListOptions } from '@/api/generated/@tanstack/react-query.gen'

const { data: teams, isLoading } = useQuery(
  teamListOptions({ path: { org_id: orgId } })
)
```

Mutating endpoints take their path and body in the variables object:

```typescript
import { useMutation } from '@tanstack/react-query'
import { teamCreateMutation } from '@/api/generated/@tanstack/react-query.gen'

const createTeam = useMutation(teamCreateMutation())

createTeam.mutate({
  path: { org_id: orgId },
  body: { name: 'Platform', slug: 'platform' },
})
```

### TanStack Query

Keep data fetching in context modules such as `src/lib/auth.tsx` and `src/lib/organizations.tsx`; pages consume the hooks. Invalidate with the generated query key so the cache matches the SDK:

```typescript
queryClient.invalidateQueries({ queryKey: organizationListQueryKey() })
```

## Testing

```bash
# Run unit tests
bun run test

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode
bun run test:watch

# Install the Playwright browser once, then run the end-to-end tests
bunx playwright install chromium
bun run test:e2e
```

End-to-end runs write an HTML report to `playwright-report/` without opening a
local server, so the command always exits with the test result.

## Deployment

### Build

```bash
bun run build
```

The output will be in the `dist/` directory.

### Deploy

Deploy the `dist/` directory to any static hosting:

- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

## Environment Variables

See `.env.example` for all available configuration options:

```env
# API URL
VITE_API_URL=https://api.example.com

# Feature flags
VITE_ENABLE_ANALYTICS=false

# App configuration
VITE_APP_NAME=MyApp
```

## License

MIT
