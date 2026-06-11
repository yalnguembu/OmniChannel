import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./swagger.json",
  output: "./src/shared/api/generated",
  parser: {
    hooks: {
      operations: {
        isQuery: (op) => {
          if (op.method === "post" && op.path.endsWith("/search")) {
            return true;
          }
        },
      },
    },
  },
  plugins: [
    "@hey-api/client-axios",
    {
      name: "@tanstack/react-query",
      queryOptions: true,
    },
    {
      enums: "typescript",
      name: "@hey-api/typescript",
    },
  ],
});
