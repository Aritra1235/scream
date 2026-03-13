import { log, shutdown, parseArgs } from "./_bootstrap";
import { getTrendingUsers } from "../src/modules/graph/services";

async function main() {
  const args = parseArgs(process.argv);
  const limit = Number(args.limit) || 10;

  log(`Trending users (top ${limit}):`);
  console.log("─".repeat(60));

  const trending = await getTrendingUsers(null, limit);
  if (trending.length === 0) {
    console.log("  (no trending users)");
  } else {
    console.log("  Rank | Username         | Display Name     | Followers | Score");
    console.log("  " + "─".repeat(56));
    trending.forEach((u, i) => {
      const rank = String(i + 1).padStart(4);
      const uname = `@${u.username || "?"}`.padEnd(17);
      const dname = (u.display_name || "").padEnd(17);
      const foll = String(u.followers_count).padStart(9);
      const score = String(u.score).padStart(5);
      console.log(`  ${rank} | ${uname}| ${dname}| ${foll} | ${score}`);
    });
  }

  await shutdown();
}

main().catch(console.error);
