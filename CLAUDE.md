@AGENTS.md

# Patelin

Free web card game about French communes. The full spec and the 132-step roadmap live in the Claude Doc "Patelin — Cahier des charges": https://claude.ai/code/artifact/347d8d4a-fc4e-406e-84f7-3d3f01783e09. Read the relevant phase there before starting work, and tick its steps when their "Fini quand" criterion is met.

## Commands

- `npm run db:up` starts PostgreSQL in Docker; `npm run db:migrate` applies Prisma migrations.
- `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm test` must pass before any commit. CI runs them, plus `npm run test:e2e`.
- `npm run test:e2e` needs the database up and Chromium installed (`npx playwright install chromium`). It starts `next dev` on port 3100; Next.js refuses a second dev server in the same project, so when one is already running, pass its port with `E2E_PORT=<port>` to reuse it.

## Conventions

- User-facing text is in French; code, comments and commit messages are in English.
- Game logic that creates value (draws, timers, distances, trades, market) runs on the server only, inside a single database transaction.
- Prisma 7: the client is generated into `generated/prisma` (git-ignored) and imported from `@/generated/prisma/client`; always go through `lib/prisma.ts`. The connection URL lives in `prisma.config.ts`, not in the schema.
- Cache Components is on: database reads in pages or route handlers either sit under `<Suspense>`, use `"use cache"`, or call `await connection()` first.
- Error boundaries receive `{ error: unknown, retry }` in this Next.js version (not `reset`).
- Log on the server with `logger` from `lib/logger.ts`, never `console.log`.
- npm 12 blocks dependency install scripts: a new dependency that needs one must be approved with `npm install-scripts approve <pkg>`.
- Rarity tiers and their thresholds live in `lib/tiers.ts`; tier colors are the `--color-tier-*` tokens in `app/globals.css`.
