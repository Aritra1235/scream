import { db, log, shutdown, parseArgs } from "./_bootstrap";
import { user } from "../src/db/schema";
import { generateId } from "../src/utils/snowflake";
import { normalizeUsername } from "../src/utils/normalize";
import { syncUserToGraph } from "../src/utils/graph-sync";

async function main() {
  const args = parseArgs(process.argv);
  const email = args.email;
  const username = args.username;
  const displayName = args.name || args.display_name || username;

  if (!email || !username) {
    console.log("Usage: bun run scripts/user-create.ts --email <email> --username <username> [--name <display_name>]");
    console.log("\nCreates a fully onboarded, email-verified user (no password -- use for test/bot accounts).");
    await shutdown();
    return;
  }

  const normalized = normalizeUsername(username);
  const id = generateId();

  await db.insert(user).values({
    id,
    name: displayName,
    email,
    username: normalized,
    displayUsername: normalized,
    display_name: displayName,
    emailVerified: true,
    onboarded: true,
  });

  await syncUserToGraph(id.toString(), normalized, displayName).catch(() => {});

  log(`Created user:`);
  console.log(`  ID:       ${id}`);
  console.log(`  Username: @${normalized}`);
  console.log(`  Email:    ${email}`);
  console.log(`  Name:     ${displayName}`);

  await shutdown();
}

main().catch(console.error);
