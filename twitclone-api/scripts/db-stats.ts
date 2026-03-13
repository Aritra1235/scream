import { db, log, logTable, shutdown } from "./_bootstrap";
import { user, posts, likes, follows, session, media, apikey } from "../src/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  log("Database statistics");
  console.log("─".repeat(50));

  const tables = [
    { name: "users", table: user },
    { name: "posts", table: posts },
    { name: "likes", table: likes },
    { name: "follows", table: follows },
    { name: "sessions", table: session },
    { name: "media", table: media },
    { name: "api_keys", table: apikey },
  ];

  const stats: { table: string; count: number }[] = [];
  for (const { name, table } of tables) {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(table);
    stats.push({ table: name, count: row?.count || 0 });
  }
  logTable(stats);

  const [dbSize] = await db.execute(
    sql`SELECT pg_size_pretty(pg_database_size(current_database())) as size`
  );
  console.log(`\nDatabase size: ${(dbSize as any).size}`);

  await shutdown();
}

main().catch(console.error);
