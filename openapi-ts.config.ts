import { defineConfig } from '@hey-api/openapi-ts'

// The vendored contract keeps a standalone checkout buildable. In a
// mattstack monorepo, point at the exported backend contract instead:
//   OPENAPI_INPUT=../backend/docs/openapi/openapi.json bun run api:generate
const input = process.env.OPENAPI_INPUT ?? 'backend/docs/openapi/openapi.json'

export default defineConfig({
  input,
  output: 'src/api/generated',
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/client-axios',
      // The shared axios instance owns the base URL, so never bake in a server.
      baseUrl: false,
      runtimeConfigPath: './src/api/runtime-config.ts',
    },
    '@hey-api/sdk',
    {
      name: 'zod',
      compatibilityVersion: 4,
      requests: true,
      responses: true,
      definitions: true,
    },
    '@tanstack/react-query',
  ],
})
