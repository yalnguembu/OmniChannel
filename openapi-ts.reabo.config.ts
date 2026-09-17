import { defineConfig } from "@hey-api/openapi-ts";

/**
 * Second generation chain, for the ReaboCanal API (`fujisat.cm:4430/api/v1`).
 *
 * `reabo-swagger.json` is a copy of `packages/ressources/swagger.json` from the
 * ReaboCanal monorepo — the two repositories stay decoupled, so the copy is
 * refreshed by hand when that API changes, then `pnpm generate:reabo` re-runs.
 *
 * The output lands in its own folder with its own axios instance, so the
 * ReaboCanal token never travels on OmniChannel requests and vice versa. No
 * `@tanstack/react-query` plugin here: the feature follows the WhatsApp
 * convention and calls `sdk.gen.ts` directly from its own hooks.
 */
export default defineConfig({
  input: "./reabo-swagger.json",
  output: "./src/shared/api/reabo/generated",
  plugins: [
    "@hey-api/client-axios",
    "@hey-api/sdk",
    {
      enums: "typescript",
      name: "@hey-api/typescript",
    },
  ],
});
