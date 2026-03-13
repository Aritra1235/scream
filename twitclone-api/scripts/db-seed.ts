import { db, log, shutdown } from "./_bootstrap";
import { user, posts, follows } from "../src/db/schema";
import { generateId } from "../src/utils/snowflake";
import { eq, sql } from "drizzle-orm";
import { syncFollowToGraph, syncPostToGraph, syncUserToGraph } from "../src/utils/graph-sync";

const SEED_USERS = [
  { name: "Alice Johnson", email: "alice_seed@example.com", username: "alice_s", display_name: "Alice Johnson", bio: "Loves graph databases" },
  { name: "Bob Smith", email: "bob_seed@example.com", username: "bob_s", display_name: "Bob Smith", bio: "Backend engineer" },
  { name: "Charlie Brown", email: "charlie_seed@example.com", username: "charlie_s", display_name: "Charlie Brown", bio: "Frontend wizard" },
  { name: "Diana Prince", email: "diana_seed@example.com", username: "diana_s", display_name: "Diana Prince", bio: "Full-stack dev" },
  { name: "Eve Torres", email: "eve_seed@example.com", username: "eve_s", display_name: "Eve Torres", bio: "Open source advocate" },
];

const SEED_POSTS = [
  "Just discovered Neo4j for social graphs, this is amazing!",
  "Working on a new feature today. Feeling productive!",
  "Who else thinks graph databases are the future of social networks?",
  "The recommendation engine is getting smarter every day",
  "Follow me for tech insights and random thoughts",
  "Building in public is the best way to learn",
  "Hot take: PostgreSQL + Neo4j is the perfect combo for social apps",
  "Just shipped a new feature. Feels good!",
];

async function main() {
  log("Seeding database with sample data...");

  const userIds: bigint[] = [];
  for (const u of SEED_USERS) {
    const id = generateId();
    try {
      await db.insert(user).values({
        id,
        name: u.name,
        email: u.email,
        username: u.username,
        displayUsername: u.username,
        display_name: u.display_name,
        bio: u.bio,
        emailVerified: true,
        onboarded: true,
      });
      userIds.push(id);
      log(`  Created user: @${u.username} (${id})`);
      await syncUserToGraph(id.toString(), u.username, u.display_name).catch(() => {});
    } catch (e: any) {
      if (e.message?.includes("unique") || e.code === "23505") {
        log(`  Skipped user @${u.username} (already exists)`);
        const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, u.email));
        if (existing) userIds.push(existing.id);
      } else {
        throw e;
      }
    }
  }

  log("\nCreating posts...");
  for (let i = 0; i < SEED_POSTS.length; i++) {
    const authorId = userIds[i % userIds.length];
    if (!authorId) continue;
    const postId = generateId();
    await db.insert(posts).values({ id: postId, userId: authorId, content: SEED_POSTS[i], mediaCount: 0 });
    await db.update(user).set({ posts_count: sql`${user.posts_count} + 1` }).where(eq(user.id, authorId));
    await syncPostToGraph(postId.toString(), authorId.toString()).catch(() => {});
    log(`  Post by user ${authorId}: "${SEED_POSTS[i].slice(0, 40)}..."`);
  }

  log("\nCreating follow relationships...");
  for (let i = 0; i < userIds.length; i++) {
    for (let j = 0; j < userIds.length; j++) {
      if (i === j) continue;
      if (Math.random() > 0.5) continue;
      try {
        await db.insert(follows).values({ followerId: userIds[i], followingId: userIds[j] });
        await db.update(user).set({ following_count: sql`${user.following_count} + 1` }).where(eq(user.id, userIds[i]));
        await db.update(user).set({ followers_count: sql`${user.followers_count} + 1` }).where(eq(user.id, userIds[j]));
        await syncFollowToGraph(userIds[i].toString(), userIds[j].toString()).catch(() => {});
        log(`  @${SEED_USERS[i].username} -> @${SEED_USERS[j].username}`);
      } catch {}
    }
  }

  log("\nSeed complete!");
  await shutdown();
}

main().catch(console.error);
