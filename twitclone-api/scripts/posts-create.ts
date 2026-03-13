import { db, log, shutdown, parseArgs } from "./_bootstrap";
import { posts, user } from "../src/db/schema";
import { eq, sql } from "drizzle-orm";
import { generateId } from "../src/utils/snowflake";
import { syncPostToGraph } from "../src/utils/graph-sync";

async function main() {
  const args = parseArgs(process.argv);
  const username = args.username;
  const content = args.content || args._0;

  if (!username || !content) {
    console.log("Usage: bun run scripts/posts-create.ts --username <username> --content '<text>'");
    console.log("       bun run scripts/posts-create.ts --username <username> '<text>'");
    console.log("\nCreates a post as the specified user.");
    await shutdown();
    return;
  }

  const [userRow] = await db.select({ id: user.id }).from(user).where(eq(user.username, username));
  if (!userRow) {
    log(`User @${username} not found.`);
    await shutdown();
    return;
  }

  const id = generateId();
  await db.insert(posts).values({ id, userId: userRow.id, content, mediaCount: 0 });
  await db.update(user).set({ posts_count: sql`${user.posts_count} + 1` }).where(eq(user.id, userRow.id));
  await syncPostToGraph(id.toString(), userRow.id.toString()).catch(() => {});

  log(`Created post:`);
  console.log(`  ID:      ${id}`);
  console.log(`  Author:  @${username}`);
  console.log(`  Content: ${content}`);

  await shutdown();
}

main().catch(console.error);
