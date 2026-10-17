import { connection } from "next/server";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

// Liveness check for Coolify and the end-to-end tests: is the app up, and can it reach the database?
export async function GET() {
  // Always answer at request time, never from a build-time prerender.
  await connection();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", database: "ok" });
  } catch (error) {
    logger.error({ err: error }, "health check: database unreachable");
    return Response.json(
      { status: "error", database: "unreachable" },
      { status: 503 },
    );
  }
}
