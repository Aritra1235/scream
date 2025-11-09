import { defineConfig } from 'drizzle-kit'
import { config } from './src/config/index'
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  verbose: true,
  
  dbCredentials: {
    url: config.database.url,
  },
})

