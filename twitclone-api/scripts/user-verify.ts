import { db, log, shutdown, parseArgs } from "./_bootstrap";
import { user } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const args = parseArgs(process.argv);
  const email = args.email;
  const username = args.username;
  const id = args.id;

  if (!email && !username && !id) {
    console.log("Usage: bun run scripts/user-verify.ts --email <email>");
    console.log("       bun run scripts/user-verify.ts --username <username>");
    console.log("       bun run scripts/user-verify.ts --id <user_id>");
    console.log("\nVerifies a user's email address in the database.");
    await shutdown();
    return;
  }

  let condition;
  let identifier: string;
  if (email) {
    condition = eq(user.email, email);
    identifier = email;
  } else if (username) {
    condition = eq(user.username, username);
    identifier = `@${username}`;
  } else {
    condition = eq(user.id, BigInt(id));
    identifier = `ID:${id}`;
  }

  const [before] = await db.select({ emailVerified: user.emailVerified, email: user.email }).from(user).where(condition);
  if (!before) {
    log(`User not found: ${identifier}`);
    await shutdown();
    return;
  }

  if (before.emailVerified) {
    log(`User ${identifier} is already email-verified.`);
    await shutdown();
    return;
  }

  await db.update(user).set({ emailVerified: true, updatedAt: new Date() }).where(condition);
  log(`Email verified for user: ${identifier} (${before.email})`);

  await shutdown();
}

main().catch(console.error);
