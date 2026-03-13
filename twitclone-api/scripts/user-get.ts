import { db, log, shutdown, parseArgs } from "./_bootstrap";
import { user, posts, follows, likes } from "../src/db/schema";
import { eq, sql, desc } from "drizzle-orm";

async function main() {
  const args = parseArgs(process.argv);
  const email = args.email;
  const username = args.username;
  const id = args.id;

  if (!email && !username && !id) {
    console.log("Usage: bun run scripts/user-get.ts --email <email>");
    console.log("       bun run scripts/user-get.ts --username <username>");
    console.log("       bun run scripts/user-get.ts --id <user_id>");
    console.log("\nShows detailed information about a single user.");
    await shutdown();
    return;
  }

  let condition;
  if (email) condition = eq(user.email, email);
  else if (username) condition = eq(user.username, username);
  else condition = eq(user.id, BigInt(id));

  const [row] = await db.select().from(user).where(condition);
  if (!row) {
    log("User not found.");
    await shutdown();
    return;
  }

  console.log("─".repeat(50));
  console.log(`  ID:              ${row.id}`);
  console.log(`  Username:        @${row.username || "(not set)"}`);
  console.log(`  Display Name:    ${row.display_name || "(not set)"}`);
  console.log(`  Email:           ${row.email}`);
  console.log(`  Email Verified:  ${row.emailVerified}`);
  console.log(`  Onboarded:       ${row.onboarded}`);
  console.log(`  Verified:        ${row.verified}`);
  console.log(`  Bio:             ${row.bio || "(empty)"}`);
  console.log(`  Followers:       ${row.followers_count}`);
  console.log(`  Following:       ${row.following_count}`);
  console.log(`  Posts:           ${row.posts_count}`);
  console.log(`  Created:         ${row.createdAt}`);
  console.log(`  Updated:         ${row.updatedAt}`);
  console.log(`  Avatar:          ${row.avatar_url}`);
  console.log(`  Banner:          ${row.banner_url}`);

  const recentPosts = await db
    .select({ id: posts.id, content: posts.content, createdAt: posts.createdAt })
    .from(posts)
    .where(eq(posts.userId, row.id))
    .orderBy(desc(posts.createdAt))
    .limit(5);

  if (recentPosts.length > 0) {
    console.log("\n  Recent Posts:");
    for (const p of recentPosts) {
      console.log(`    [${p.id}] ${p.content.slice(0, 60)}${p.content.length > 60 ? "..." : ""}`);
    }
  }

  console.log("─".repeat(50));
  await shutdown();
}

main().catch(console.error);
