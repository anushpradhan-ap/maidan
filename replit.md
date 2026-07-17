# G.G. Maidan

Nepal's premier esports tournament platform — players register for tournaments, track live standings, climb leaderboards, and follow news across PUBG Mobile, Free Fire, Valorant, and more.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxy at /api)
- `pnpm --filter @workspace/gg-maidan run dev` — run the frontend (proxy at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter routing, Tailwind CSS, Framer Motion, shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (API), Vite (frontend)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (one file per entity)
- `artifacts/api-server/src/routes/` — Express route handlers (one file per domain)
- `artifacts/gg-maidan/src/` — React frontend pages and components
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — generated Zod schemas for server validation (do not edit)

## Architecture decisions

- Dark-only esports aesthetic with electric purple (#8B5CF6) + neon blue (#3B82F6) palette; no light mode
- OpenAPI-first: all API changes start in `openapi.yaml`, then `codegen` regenerates hooks and Zod schemas
- Tournaments have `status: upcoming | live | completed` — drives filtering across the entire platform
- Live tournament data (standings, kill feed) stored in `standings` and `live_updates` tables; no WebSocket for MVP
- Seed data uses Picsum Photos for gallery images; real images can replace via admin later

## Product

- **Home**: Hero, community stats, featured/live tournaments, top players, news strip, sponsors, app CTA
- **Tournaments**: Browse by status (Upcoming/Live/Completed), detail with brackets/schedule/standings/registration
- **Games**: Catalog of supported titles with active player/tournament counts
- **Teams & Players**: Ranked profiles with match history, stats, badges
- **Leaderboard**: Toggle individual/team rankings with game filter
- **Live**: War-room real-time standings, kill feed, round tracker
- **News**: Blog with category filters (tournament/gaming/recap/announcement/patch)
- **Gallery, Sponsors, About, Contact**: Supporting pages

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any `openapi.yaml` change, run `pnpm --filter @workspace/api-spec run codegen` before touching backend or frontend
- `lib/api-zod` Zod schema names follow Orval conventions: `ListTournamentsQueryParams`, `CreateTournamentBody`, `GetTournamentParams` — use grep to find exact names before writing route handlers
- Avoid `type: ["object", "null"]` in OpenAPI spec — Orval generates `zod.looseObject` which doesn't exist in zod v3; use a `$ref` to a named schema instead

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
