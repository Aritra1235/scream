import { Elysia } from 'elysia'
import { opentelemetry } from '@elysiajs/opentelemetry'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { betterAuth, betterAuthView } from "./modules/auth";
import { onboarding } from "./modules/onboarding";
import { imgUpload } from "./modules/imgUpload";
import { post } from "./modules/post";
import { config } from "./config";
import { like } from "./modules/like";


const app = new Elysia()
  .get('/', () => 'Hello World!')
  .use(
    cors({
      origin: "http://localhost:3001",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(betterAuth)
  .all("/api/auth/*", betterAuthView)
  .use(onboarding)
  .use(imgUpload)
  .use(post)
  .use(like)
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