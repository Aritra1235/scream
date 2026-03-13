import { db, log, logTable, shutdown, parseArgs } from "./_bootstrap";
import { user } from "../src/db/schema";
import { desc, sql, ilike } from "drizzle-orm";

async function main() {
  const args = parseArgs(process.argv);
  const limit = Number(args.limit) || 50;
  const search = args.search;

  log(`Listing users (limit: ${limit})${search ? `, search: "${search}"` : ""}`);
  console.log("─".repeat(60));

  let query = db
    .select({
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      email: user.email,
      verified: user.verified,
      emailVerified: user.emailVerified,
      onboarded: user.onboarded,
      followers: user.followers_count,
      following: user.following_count,
      posts: user.posts_count,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(limit);

  if (search) {
    query = query.where(
      sql`${user.username} ILIKE ${"%" + search + "%"} OR ${user.email} ILIKE ${"%" + search + "%"} OR ${user.display_name} ILIKE ${"%" + search + "%"}`
    ) as any;
  }

  const rows = await query;
  logTable(rows);
  console.log(`\nTotal shown: ${rows.length}`);

  await shutdown();
}

main().catch(console.error);
