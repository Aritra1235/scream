import { db, log, logTable, shutdown, parseArgs } from "./_bootstrap";
import { posts, user, follows, likes } from "../src/db/schema";
import { eq, desc, isNull, inArray, sql } from "drizzle-orm";

async function main() {
  const args = parseArgs(process.argv);
  const username = args.username;
  const mode = args.mode || "all";

  if (!username) {
    console.log("Usage: bun run scripts/feed-debug.ts --username <username> [--mode all|following]");
    console.log("\nDebug what a user's feed looks like.");
    await shutdown();
    return;
  }

  const [userRow] = await db.select({ id: user.id }).from(user).where(eq(user.username, username));
  if (!userRow) {
    log(`User @${username} not found.`);
    await shutdown();
    return;
  }

  log(`Feed debug for @${username} (mode: ${mode})`);
  console.log("─".repeat(70));

  const followingRows = await db
    .select({ id: follows.followingId, username: user.username })
    .from(follows)
    .innerJoin(user, eq(follows.followingId, user.id))
    .where(eq(follows.followerId, userRow.id));

  console.log(`\nFollowing (${followingRows.length}):`);
  for (const f of followingRows) {
    console.log(`  @${f.username} (${f.id})`);
  }

  let feedQuery;
  if (mode === "following") {
    const followingIds = followingRows.map((r) => r.id);
    followingIds.push(userRow.id);
    if (followingIds.length === 0) {
      log("\nNo following -- feed would be empty.");
      await shutdown();
      return;
    }
    feedQuery = db
      .select({
        id: posts.id,
        author: user.username,
        content: posts.content,
        likes: posts.likes_count,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .innerJoin(user, eq(posts.userId, user.id))
      .where(inArray(posts.userId, followingIds))
      .orderBy(desc(posts.createdAt))
      .limit(20);
  } else {
    feedQuery = db
      .select({
        id: posts.id,
        author: user.username,
        content: posts.content,
        likes: posts.likes_count,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .innerJoin(user, eq(posts.userId, user.id))
      .where(isNull(posts.parentId))
      .orderBy(desc(posts.createdAt))
      .limit(20);
  }

  const feedPosts = await feedQuery;
  console.log(`\nFeed posts (${feedPosts.length}):`);
  logTable(feedPosts.map((p) => ({
    ...p,
    content: p.content.length > 45 ? p.content.slice(0, 45) + "..." : p.content,
  })));

  const [likeCount] = await db.select({ count: sql<number>`count(*)` }).from(likes).where(eq(likes.userId, userRow.id));
  console.log(`\nLikes given by @${username}: ${likeCount?.count || 0}`);

  await shutdown();
}

main().catch(console.error);
