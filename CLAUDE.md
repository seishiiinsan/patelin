@AGENTS.md

# Patelin

Free web card game about French communes. The full spec and the 132-step roadmap live in the Claude Doc "Patelin — Cahier des charges": https://claude.ai/code/artifact/347d8d4a-fc4e-406e-84f7-3d3f01783e09. Read the relevant phase there before starting work, and tick its steps when their "Fini quand" criterion is met.

## Commands

- `npm run db:up` starts PostgreSQL in Docker; `npm run db:migrate` applies Prisma migrations.
- `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm test` must pass before any commit. CI runs them, plus `npm run test:e2e`.
- `npm run data:import` fills the database (communes, photos, sets, contours) and runs `data:check`; `data:postcards` is a separate ~45 min resumable run. Every data script is idempotent.
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
- Client hooks that read the URL (`usePathname`, `useSearchParams`) must render under `<Suspense>` (see `components/site-header.tsx`), or dynamic routes fail to prerender.
- Commune photos are Wikimedia thumbnails rendered with `next/image` (hosts allowed in `next.config.ts`), so browsers never call Wikimedia; always show the stored author and license.
- The public map files (`public/geo/`) carry INSEE codes only, never commune names: the map must not help a placement. DROM appear as insets on the France map; `lib/drom-insets.ts` converts between inset and real coordinates.
- Auth is Better Auth (`lib/auth.ts`), not Auth.js. In pages and server actions, get the player with `requirePlayer()` (signed in and has a pseudo) or `requireSignedIn()` from `lib/session.ts`; `proxy.ts` only does an optimistic cookie redirect. The pseudo is public; `name` and `email` from Google/Discord stay private.
- After a session change (sign-in, sign-out, account deletion), navigate with a full page load, not `router.push`: the client router may hold prefetches made under the previous session.
- Email + password sign-in exists only when `AUTH_DEV_LOGIN=true` (local dev and e2e). The e2e server also sets `AUTH_DISABLE_RATE_LIMIT=true`, because Better Auth rate-limits sign-ins per IP in production. Neither is ever set in production.
- Communes are never deleted: one that disappears from the INSEE list gets `isActive = false` and leaves the draw.
