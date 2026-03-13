import { db, log, logTable, shutdown, parseArgs } from "./_bootstrap";
import { posts, user } from "../src/db/schema";
import { desc, eq } from "drizzle-orm";

async function main() {
  const args = parseArgs(process.argv);
  const limit = Number(args.limit) || 20;
  const username = args.username;

  log(`Listing posts (limit: ${limit})${username ? ` by @${username}` : ""}`);
  console.log("─".repeat(70));

  let query = db
    .select({
      id: posts.id,
      author: user.username,
      content: posts.content,
      likes: posts.likes_count,
      mediaCount: posts.mediaCount,
      parentId: posts.parentId,
      repostOf: posts.repostOf,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .innerJoin(user, eq(posts.userId, user.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  if (username) {
    query = query.where(eq(user.username, username)) as any;
  }

  const rows = await query;
  logTable(rows.map((r) => ({
    ...r,
    content: r.content.length > 50 ? r.content.slice(0, 50) + "..." : r.content,
  })));

  console.log(`\nShown: ${rows.length}`);
  await shutdown();
}

main().catch(console.error);
