# API Performance Comparison

Compares the two backend implementations:
- **Bun/Elysia** (TypeScript) on port 3000
- **Go/Chi** on port 3002

## Prerequisites

Both servers must be running, plus the TS auth server (port 3000) since Go proxies auth to it.

```bash
# Terminal 1: TS backend (port 3000)
cd twitclone-api && bun run dev

# Terminal 2: Go backend (port 3002)
cd api-go && go run ./cmd/server

# Terminal 3: Run benchmark
cd api-comparison && ./benchmark.sh 50
```

## What it tests

| Endpoint | Auth Required | Description |
|----------|:---:|---|
| `GET /` | No | Health check / hello world |
| `GET /api/v1/feed` | Yes | Main feed (5 posts) |
| `GET /api/v1/feed/following` | Yes | Following-only feed |
| `GET /api/v1/profile/me` | Yes | Current user profile |
| `GET /api/v1/profile/:username` | No | Public profile lookup |
| `GET /api/v1/followers/:username` | No | Followers list |
| `GET /api/v1/following/:username` | No | Following list |
| `GET /api/v1/graph/trending` | Yes | Neo4j trending users |
| `GET /api/v1/onboarding/:id` | No | Onboarding status |
| `GET /api/v1/username/:name` | No | Username availability |

## Output

The script prints results to stdout and saves a Markdown report to `results_<timestamp>.md`.
