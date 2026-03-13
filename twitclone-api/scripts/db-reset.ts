import { db, log, shutdown, getNeo4jSession } from "./_bootstrap";
import { user, posts, likes, follows, session, media, apikey, account, verification } from "../src/db/schema";
import { parseArgs } from "./_bootstrap";

async function main() {
  const args = parseArgs(process.argv);
  const force = args.force === "true" || args.force === undefined;

  if (!force) {
    log("WARNING: This will delete ALL data from the database.");
    log("Run with --force to confirm.");
    await shutdown();
    return;
  }

  log("Resetting database (deleting all data)...");

  await db.delete(likes);
  log("  Cleared likes");

  await db.delete(media);
  log("  Cleared media");

  await db.delete(apikey);
  log("  Cleared api keys");

  await db.delete(posts);
  log("  Cleared posts");

  await db.delete(follows);
  log("  Cleared follows");

  await db.delete(session);
  log("  Cleared sessions");

  await db.delete(account);
  log("  Cleared accounts");

  await db.delete(verification);
  log("  Cleared verifications");

  await db.delete(user);
  log("  Cleared users");

  log("\nResetting Neo4j graph...");
  try {
    const neo = getNeo4jSession();
    await neo.run("MATCH (n) DETACH DELETE n");
    await neo.close();
    log("  Cleared all Neo4j nodes and relationships");
  } catch (e) {
    log("  Neo4j reset skipped (not available)");
  }

  log("\nDatabase reset complete!");
  await shutdown();
}

main().catch(console.error);
