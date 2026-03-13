import { db, log, shutdown } from "./_bootstrap";
import { user, posts, follows, likes } from "../src/db/schema";
import { eq, sql, and, isNull } from "drizzle-orm";

async function main() {
  log("Recalculating denormalized counters...");
  console.log("─".repeat(50));

  const users = await db.select({ id: user.id, username: user.username }).from(user);
  let fixed = 0;

  for (const u of users) {
    const [postCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.userId, u.id));

    const [followerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, u.id));

    const [followingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, u.id));

    const [current] = await db
      .select({
        posts_count: user.posts_count,
        followers_count: user.followers_count,
        following_count: user.following_count,
      })
      .from(user)
      .where(eq(user.id, u.id));

    const newPosts = postCount?.count || 0;
    const newFollowers = followerCount?.count || 0;
    const newFollowing = followingCount?.count || 0;

    if (
      current.posts_count !== newPosts ||
      current.followers_count !== newFollowers ||
      current.following_count !== newFollowing
    ) {
      await db.update(user).set({
        posts_count: newPosts,
        followers_count: newFollowers,
        following_count: newFollowing,
        updatedAt: new Date(),
      }).where(eq(user.id, u.id));
      fixed++;
      log(`  Fixed @${u.username}: posts ${current.posts_count}->${newPosts}, followers ${current.followers_count}->${newFollowers}, following ${current.following_count}->${newFollowing}`);
    }
  }

  log("\nRecalculating post like counts...");
  const allPosts = await db.select({ id: posts.id, likes_count: posts.likes_count }).from(posts);
  let likesFixed = 0;

  for (const p of allPosts) {
    const [likeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(likes)
      .where(eq(likes.postId, p.id));

    const newCount = likeCount?.count || 0;
    if (p.likes_count !== newCount) {
      await db.update(posts).set({ likes_count: newCount }).where(eq(posts.id, p.id));
      likesFixed++;
    }
  }

  log(`\nDone! Fixed ${fixed} user counter(s) and ${likesFixed} post like counter(s).`);
  await shutdown();
}

main().catch(console.error);
