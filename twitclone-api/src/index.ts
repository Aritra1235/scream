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
import { suggestions } from "./modules/suggestions";
import { initNeo4j, closeNeo4j } from "./db/neo4j";

// Initialise Neo4j constraints and verify connectivity (non-blocking)
void initNeo4j();

const webAppUrl = resolveWebAppUrl();
const corsOrigins = Array.from(new Set([webAppUrl, ...config.misc.corsOrigins].filter(Boolean)));

const app = new Elysia()
  .get('/', () => 'Hello World!')
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
  .use(suggestions)
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


console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

// Graceful shutdown
process.on('SIGTERM', async () => {
  await closeNeo4j();
  process.exit(0);
});
process.on('SIGINT', async () => {
  await closeNeo4j();
  process.exit(0);
});
