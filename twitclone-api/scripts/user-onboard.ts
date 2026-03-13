import { db, log, shutdown, parseArgs } from "./_bootstrap";
import { user } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { normalizeUsername } from "../src/utils/normalize";
import { syncUserToGraph } from "../src/utils/graph-sync";

async function main() {
  const args = parseArgs(process.argv);
  const email = args.email;
  const id = args.id;
  const username = args.username;
  const displayName = args.name || args.display_name;
  const bio = args.bio || null;

  if ((!email && !id) || !username) {
    console.log("Usage: bun run scripts/user-onboard.ts --email <email> --username <username> [--name <display_name>] [--bio <bio>]");
    console.log("       bun run scripts/user-onboard.ts --id <user_id> --username <username> [--name <display_name>] [--bio <bio>]");
    console.log("\nManually onboards a user (sets username, display name, onboarded=true).");
    await shutdown();
    return;
  }

  const condition = email ? eq(user.email, email) : eq(user.id, BigInt(id));
  const [existing] = await db.select({ id: user.id, email: user.email }).from(user).where(condition);
  if (!existing) {
    log("User not found.");
    await shutdown();
    return;
  }

  const normalized = normalizeUsername(username);
  await db.update(user).set({
    username: normalized,
    displayUsername: normalized,
    display_name: displayName || normalized,
    bio,
    onboarded: true,
    emailVerified: true,
    updatedAt: new Date(),
  }).where(condition);

  await syncUserToGraph(existing.id.toString(), normalized, displayName || normalized).catch(() => {});

  log(`Onboarded user:`);
  console.log(`  ID:       ${existing.id}`);
  console.log(`  Email:    ${existing.email}`);
  console.log(`  Username: @${normalized}`);
  console.log(`  Name:     ${displayName || normalized}`);

  await shutdown();
}

main().catch(console.error);
