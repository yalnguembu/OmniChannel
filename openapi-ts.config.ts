import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "./spec.yml",
  output: "./src/shared/api",
  plugins: [
    "@hey-api/schemas",
    "@hey-api/client-axios",
    "@tanstack/react-query",
    "zod",
    {
      enums: "typescript",
      name: "@hey-api/typescript",
    },
  ],
})
