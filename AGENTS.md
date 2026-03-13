# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Scream is a full-stack Twitter/X clone ("TwitClone") monorepo with two services:

| Service | Directory | Runtime | Package Manager | Dev Port |
|---|---|---|---|---|
| Backend API | `twitclone-api/` | Bun (Elysia.js) | bun | 3000 |
| Frontend Web | `twitclone-web/` | Node.js (Next.js 16) | pnpm | 3001 |

PostgreSQL is required as the primary data store (Drizzle ORM). Neo4j is used as a secondary graph database for social graph features (follow recommendations, trending users, mutual followers).

### Starting services

1. **PostgreSQL**: `sudo pg_ctlcluster 16 main start` (verify with `pg_isready`)
2. **Neo4j**: `sudo -u neo4j neo4j start` (verify at http://localhost:7474, credentials: neo4j/neo4jdev)
3. **Backend**: `cd twitclone-api && bun run dev` (runs on port 3000 with `--watch`; auto-seeds Neo4j from Postgres on startup)
4. **Frontend**: `cd twitclone-web && pnpm dev` (runs on port 3001)

### Key commands

- **Lint (frontend)**: `cd twitclone-web && pnpm lint` (uses Biome)
- **Format (frontend)**: `cd twitclone-web && pnpm format`
- **Build (frontend)**: `cd twitclone-web && pnpm build`
- **DB schema push**: `cd twitclone-api && bun run db:push`
- **DB migrations**: `cd twitclone-api && bun run db:generate && bun run db:migrate`

### Non-obvious caveats

- The backend has no dedicated test suite (`npm test` just echoes an error). Validate backend changes via API calls (curl) or the frontend UI.
- `DONT_SEND_EMAIL=true` must be set in the API `.env` to skip Mailgun in local dev. Without it, sign-up flows will fail trying to send verification emails.
- After creating a user with `DONT_SEND_EMAIL=true`, you must manually verify the email in the database: `sudo -u postgres psql -d twitclone -c "UPDATE \"user\" SET \"emailVerified\" = true WHERE email = '...';"`.
- Users must also be onboarded (set `username`, `displayUsername`, `onboarded=true` in the `user` table) before the frontend home feed works correctly.
- AWS S3, Mailgun, Axiom, and CDN configs use placeholder values in local dev -- media uploads and observability features won't work, but core posting/auth/feed features function fine.
- The `.env` files (`twitclone-api/.env` and `twitclone-web/.env`) are gitignored. Copy from `.env.example` and adjust as needed.
- The PostgreSQL database, user, and schema must exist before starting the API. The update script handles `bun run db:push` to keep the schema in sync.
- Neo4j is auto-seeded from PostgreSQL data when the backend starts. If Neo4j is not running, the backend still starts but graph features (suggestions, trending, mutual followers) will return empty results or fall back gracefully.
- Neo4j default credentials for local dev: `neo4j` / `neo4jdev` on `bolt://localhost:7687`.
