import { access, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { isAbsolute, join } from "node:path";

import config from "../openapi-ts.config";
import { generateApi } from "./api-generate";

const ROOT = new URL("..", import.meta.url).pathname;

const HTTP_METHODS = {
  get: true,
  put: true,
  post: true,
  delete: true,
  options: true,
  head: true,
  patch: true,
  trace: true,
} as const;
const EXPECTED_OUTPUT = [
  "types.gen.ts",
  "sdk.gen.ts",
  "zod.gen.ts",
  "client.gen.ts",
  "@tanstack/react-query.gen.ts",
];

interface Contract {
  paths: Record<string, Record<string, unknown>>;
}

/**
 * Fail when the vendored contract no longer generates the client. The client
 * itself is a git-ignored build artifact, so the invariant is that every
 * operation in the selected contract has an SDK function.
 */
async function main() {
  const apiDirectory = join(ROOT, "src/api");
  await mkdir(apiDirectory, { recursive: true });
  const temporary = await mkdtemp(join(apiDirectory, ".api-check-"));

  try {
    await generateApi(temporary);

    for (const file of EXPECTED_OUTPUT) await access(join(temporary, file));

    const operations = Object.values((await readContract()).paths).reduce(
      (total, path) =>
        total + Object.keys(path).filter((key) => key in HTTP_METHODS).length,
      0,
    );
    const sdk = await readFile(join(temporary, "sdk.gen.ts"), "utf8");
    const exported = sdk.match(/^export const /gm)?.length ?? 0;

    if (exported !== operations) {
      throw new Error(
        `Generated SDK has ${exported} operations, but the contract declares ${operations}.`,
      );
    }
    console.log(`Generated API covers all ${operations} contract operations.`);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

async function readContract(): Promise<Contract> {
  const { input } = await config;
  if (typeof input !== "string") {
    throw new Error("openapi-ts.config.ts must set a single string input");
  }
  const path = isAbsolute(input) ? input : join(ROOT, input);
  return JSON.parse(await readFile(path, "utf8")) as Contract;
}

await main();
