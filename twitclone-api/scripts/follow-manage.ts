import { db, log, logTable, shutdown, parseArgs } from "./_bootstrap";
import { user, follows } from "../src/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { followUser, unfollowUser, getFollowers, getFollowing } from "../src/modules/follow/services";

async function main() {
  const args = parseArgs(process.argv);
  const action = args._0 || args.action;

  if (!action || !["follow", "unfollow", "followers", "following"].includes(action)) {
    console.log("Usage:");
    console.log("  bun run scripts/follow-manage.ts follow --from <username> --to <username>");
    console.log("  bun run scripts/follow-manage.ts unfollow --from <username> --to <username>");
    console.log("  bun run scripts/follow-manage.ts followers --username <username>");
    console.log("  bun run scripts/follow-manage.ts following --username <username>");
    await shutdown();
    return;
  }

  async function getUserId(username: string): Promise<bigint | null> {
    const [row] = await db.select({ id: user.id }).from(user).where(eq(user.username, username));
    return row?.id || null;
  }

  if (action === "follow" || action === "unfollow") {
    const from = args.from;
    const to = args.to;
    if (!from || !to) {
      log("Missing --from or --to username.");
      await shutdown();
      return;
    }

    const fromId = await getUserId(from);
    const toId = await getUserId(to);
    if (!fromId) { log(`User @${from} not found.`); await shutdown(); return; }
    if (!toId) { log(`User @${to} not found.`); await shutdown(); return; }

    if (action === "follow") {
      await followUser(fromId, toId);
      log(`@${from} now follows @${to}`);
    } else {
      await unfollowUser(fromId, toId);
      log(`@${from} unfollowed @${to}`);
    }
  }

  if (action === "followers" || action === "following") {
    const username = args.username;
    if (!username) {
      log("Missing --username.");
      await shutdown();
      return;
    }

    const userId = await getUserId(username);
    if (!userId) { log(`User @${username} not found.`); await shutdown(); return; }

    if (action === "followers") {
      const list = await getFollowers(userId, 100);
      log(`Followers of @${username} (${list.length}):`);
      for (const f of list) {
        console.log(`  @${f.username} - ${f.display_name} (${f.followers_count} followers)`);
      }
    } else {
      const list = await getFollowing(userId, 100);
      log(`@${username} is following (${list.length}):`);
      for (const f of list) {
        console.log(`  @${f.username} - ${f.display_name} (${f.followers_count} followers)`);
      }
    }
  }

  await shutdown();
}

main().catch(console.error);
