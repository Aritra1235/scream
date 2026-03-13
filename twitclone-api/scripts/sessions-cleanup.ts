import { db, log, shutdown } from "./_bootstrap";
import { session } from "../src/db/schema";
import { lt, sql } from "drizzle-orm";

async function main() {
  log("Cleaning up expired sessions...");

  const [before] = await db.select({ count: sql<number>`count(*)` }).from(session);
  log(`  Total sessions: ${before?.count || 0}`);

  const deleted = await db
    .delete(session)
    .where(lt(session.expiresAt, new Date()))
    .returning();

  log(`  Deleted ${deleted.length} expired session(s)`);

  const [after] = await db.select({ count: sql<number>`count(*)` }).from(session);
  log(`  Remaining sessions: ${after?.count || 0}`);

  await shutdown();
}

main().catch(console.error);
