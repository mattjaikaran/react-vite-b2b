import { createClient } from "@hey-api/openapi-ts";

import config from "../openapi-ts.config";

/**
 * Generate the OpenAPI client from the contract selected by the config.
 * `output` exists so `api:check` can generate into a scratch directory
 * without touching the generated `src/api/generated`.
 */
export async function generateApi(output?: string) {
  const resolved = await config;
  await createClient({
    ...resolved,
    output: output ?? (resolved.output as string),
  });
}

if (import.meta.main) await generateApi();
