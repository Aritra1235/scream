import { db, log, shutdown, parseArgs, getNeo4jSession } from "./_bootstrap";
import { posts, user } from "../src/db/schema";
import { eq, sql } from "drizzle-orm";

async function main() {
  const args = parseArgs(process.argv);
  const postId = args.id || args._0;

  if (!postId) {
    console.log("Usage: bun run scripts/posts-delete.ts --id <post_id>");
    console.log("       bun run scripts/posts-delete.ts <post_id>");
    console.log("\nDeletes a post by ID.");
    await shutdown();
    return;
  }

  const [existing] = await db
    .select({ id: posts.id, userId: posts.userId, content: posts.content })
    .from(posts)
    .where(eq(posts.id, BigInt(postId)));

  if (!existing) {
    log(`Post ${postId} not found.`);
    await shutdown();
    return;
  }

  await db.delete(posts).where(eq(posts.id, BigInt(postId)));
  await db.update(user).set({ posts_count: sql`${user.posts_count} - 1` }).where(eq(user.id, existing.userId));

  try {
    const neo = getNeo4jSession();
    await neo.run("MATCH (p:Post {id: $id}) DETACH DELETE p", { id: postId });
    await neo.close();
  } catch {}

  log(`Deleted post ${postId}: "${existing.content.slice(0, 50)}..."`);
  await shutdown();
}

main().catch(console.error);
