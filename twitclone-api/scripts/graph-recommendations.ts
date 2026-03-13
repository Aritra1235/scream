import { db, log, shutdown, parseArgs, getNeo4jSession } from "./_bootstrap";
import { user } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { getWhoToFollow, getMutualFollowers } from "../src/modules/graph/services";

async function main() {
  const args = parseArgs(process.argv);
  const username = args.username;
  const targetUsername = args.target;
  const limit = Number(args.limit) || 10;

  if (!username) {
    console.log("Usage: bun run scripts/graph-recommendations.ts --username <username> [--limit <n>]");
    console.log("       bun run scripts/graph-recommendations.ts --username <username> --target <other_username>");
    console.log("\nShows who-to-follow suggestions for a user, or mutual followers between two users.");
    await shutdown();
    return;
  }

  const [userRow] = await db.select({ id: user.id }).from(user).where(eq(user.username, username));
  if (!userRow) {
    log(`User @${username} not found.`);
    await shutdown();
    return;
  }

  if (targetUsername) {
    const [targetRow] = await db.select({ id: user.id }).from(user).where(eq(user.username, targetUsername));
    if (!targetRow) {
      log(`Target user @${targetUsername} not found.`);
      await shutdown();
      return;
    }

    log(`Mutual followers between @${username} and @${targetUsername}:`);
    console.log("─".repeat(50));
    const mutuals = await getMutualFollowers(userRow.id.toString(), targetRow.id.toString(), limit);
    if (mutuals.length === 0) {
      console.log("  (no mutual followers)");
    } else {
      for (const m of mutuals) {
        console.log(`  @${m.username} - ${m.display_name}`);
      }
    }
  } else {
    log(`Who-to-follow suggestions for @${username} (limit: ${limit}):`);
    console.log("─".repeat(50));
    const suggestions = await getWhoToFollow(userRow.id.toString(), limit);
    if (suggestions.length === 0) {
      console.log("  (no suggestions)");
    } else {
      for (const s of suggestions) {
        const mutual = s.mutualCount > 0 ? ` (${s.mutualCount} mutual)` : "";
        console.log(`  @${s.username} - ${s.display_name} | ${s.followers_count} followers${mutual}`);
      }
    }
  }

  await shutdown();
}

main().catch(console.error);
