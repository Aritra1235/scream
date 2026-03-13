import { db, log, shutdown, parseArgs, getNeo4jSession } from "./_bootstrap";
import { user } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const args = parseArgs(process.argv);
  const email = args.email;
  const username = args.username;
  const id = args.id;

  if (!email && !username && !id) {
    console.log("Usage: bun run scripts/user-delete.ts --email <email>");
    console.log("       bun run scripts/user-delete.ts --username <username>");
    console.log("       bun run scripts/user-delete.ts --id <user_id>");
    console.log("\nDeletes a user and all their data (posts, likes, follows cascade).");
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

  const [existing] = await db.select({ id: user.id, username: user.username, email: user.email }).from(user).where(condition);
  if (!existing) {
    log(`User not found: ${identifier}`);
    await shutdown();
    return;
  }

  await db.delete(user).where(eq(user.id, existing.id));
  log(`Deleted user: @${existing.username} (${existing.email})`);

  try {
    const neo = getNeo4jSession();
    await neo.run("MATCH (u:User {id: $id}) DETACH DELETE u", { id: existing.id.toString() });
    await neo.close();
    log("  Removed from Neo4j graph");
  } catch {
    log("  Neo4j cleanup skipped");
  }

  await shutdown();
}

main().catch(console.error);
