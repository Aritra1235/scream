import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = Bun.env.DATABASE_URL 

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}
console.log('connectionString', connectionString)
const client = postgres(connectionString)

export const db = drizzle(client)

export { client }

