import { defineConfig } from "vitest/config";

// Tests that run against the PostgreSQL database of DATABASE_URL (`npm run test:db`). They
// create their own fixture rows and remove them afterwards. CI runs them in the e2e job.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["**/*.db.test.ts"],
    exclude: ["node_modules/**", ".next/**", "generated/**", "e2e/**"],
    setupFiles: ["dotenv/config"],
  },
});
