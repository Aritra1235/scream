import { Elysia } from 'elysia'
import { opentelemetry } from '@elysiajs/opentelemetry'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { betterAuth, betterAuthView } from "./modules/auth";
import { onboarding } from "./modules/onboarding";
import { imgUpload } from "./modules/imgUpload";
import { posts } from "./modules/post";
import { config } from "./config";
import { like } from "./modules/like";
import { feed } from "./modules/feed";
import { username } from "./modules/username";
import { apiKeyModule } from "./modules/apikey";
import { profile } from "./modules/profile";  
import { resolveWebAppUrl } from "./utils/auth.service";
import { password } from "./modules/password";
import { follow } from "./modules/follow";
import { graph } from "./modules/graph";
import { initNeo4jSchema } from "./utils/neo4j";
import { seedGraphFromPostgres } from "./utils/graph-sync";
import { client } from "./db/client";
import { getNeo4jDriver } from "./utils/neo4j";

const CHECK_TIMEOUT_MS = 2500;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

async function runCheck(name: string, check: () => Promise<unknown>) {
  const startedAt = performance.now();
  try {
    await withTimeout(check(), CHECK_TIMEOUT_MS);
    return {
      name,
      status: "up",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      name,
      status: "down",
      latencyMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const webAppUrl = resolveWebAppUrl();
const corsOrigins = Array.from(new Set([webAppUrl, ...config.misc.corsOrigins].filter(Boolean)));

const app = new Elysia()
  .get('/', () => 'Hello World!')
  .get('/health', async ({ status }) => {
    const checks = await Promise.all([
      runCheck("postgres", async () => {
        await client`select 1`;
      }),
      runCheck("neo4j", async () => {
        await getNeo4jDriver().verifyConnectivity();
      }),
    ]);

    const allHealthy = checks.every((check) => check.status === "up");
    const memory = process.memoryUsage();

    const payload = {
      status: allHealthy ? "ok" : "degraded",
      service: "twitclone-api",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      runtime: {
        bun: Bun.version,
        nodeCompat: process.version,
        environment: process.env.NODE_ENV ?? "development",
      },
      server: {
        port: config.misc.port,
      },
      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external,
      },
      checks: Object.fromEntries(checks.map((check) => [check.name, check])),
    };

    if (!allHealthy) {
      return status(503, payload);
    }

    return status(200, payload);
  })
  .use(
    cors({
      origin: corsOrigins,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(betterAuth)
  .all("/api/auth/*", betterAuthView)
  .use(onboarding)
  .use(imgUpload)
  .use(posts)
  .use(like)
  .use(feed)
  .use(username)
  .use(apiKeyModule)
  .use(profile)
  .use(password)
  .use(follow)
  .use(graph)
  .use(openapi())
  .use(
    opentelemetry({
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: 'https://api.axiom.co/v1/traces',
            headers: {
              Authorization: `Bearer ${config.axiom.token}`,
              'X-Axiom-Dataset': config.axiom.dataset
            }
          })
        )
      ]
	})
  )
  .listen(config.misc.port)


console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

initNeo4jSchema()
    .then(() => seedGraphFromPostgres())
    .catch((err) => console.error("[neo4j] Initialization failed:", err))
