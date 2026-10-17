import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Read without `env()` so that `prisma generate` also works without a database.
    url: process.env.DATABASE_URL,
  },
});
