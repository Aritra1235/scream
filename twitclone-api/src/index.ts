import { Elysia } from 'elysia'
import { opentelemetry } from '@elysiajs/opentelemetry'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'

const app = new Elysia()
  .get('/', () => 'Hello World!')
  .use(cors(
    {
      origin: '*'
    }
  ))
  .use(openapi())
  .use(
    opentelemetry({
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: 'https://api.axiom.co/v1/traces',
            headers: {
              Authorization: `Bearer ${Bun.env.AXIOM_TOKEN}`,
              'X-Axiom-Dataset': Bun.env.AXIOM_DATASET ?? ''
            }
          })
        )
      ]
	})
  )
  .listen(3000)


console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)