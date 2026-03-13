import { getNeo4jSession, log, shutdown } from "./_bootstrap";
import { initNeo4jSchema } from "../src/utils/neo4j";

async function main() {
  log("Resetting Neo4j graph...");

  const session = getNeo4jSession();
  try {
    await session.run("MATCH (n) DETACH DELETE n");
    log("  Deleted all nodes and relationships");
    await session.close();

    await initNeo4jSchema();
    log("  Re-created constraints and indexes");
  } catch (e: any) {
    log(`  Failed: ${e.message}`);
  }

  log("Done!");
  await shutdown();
}

main().catch(console.error);
