import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

// ISO timestamp built from performance.now(): Cache Components rejects Date.now() during a
// prerender, and instrumentation.ts can log from inside one (dev validates pages that throw).
function isoTime() {
  const now = new Date(performance.timeOrigin + performance.now());
  return `,"time":"${now.toISOString()}"`;
}

// One JSON line per event on stdout, so that Coolify (and `docker logs`) can collect and filter them.
export const logger = pino({
  base: { app: "patelin" },
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  timestamp: isoTime,
});
