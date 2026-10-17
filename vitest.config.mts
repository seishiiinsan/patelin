import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolve the `@/` alias from tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    // End-to-end specs belong to Playwright, database tests to vitest.db.config.mts.
    exclude: [
      "node_modules/**",
      ".next/**",
      "generated/**",
      "e2e/**",
      "**/*.db.test.ts",
    ],
  },
});
