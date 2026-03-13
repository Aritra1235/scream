import { log, shutdown } from "./_bootstrap";
import { seedGraphFromPostgres } from "../src/utils/graph-sync";
import { initNeo4jSchema } from "../src/utils/neo4j";

async function main() {
  log("Full graph re-sync: PostgreSQL -> Neo4j");
  console.log("─".repeat(50));

  log("Initializing Neo4j schema...");
  await initNeo4jSchema();

  log("Syncing all data...");
  await seedGraphFromPostgres();

  log("Sync complete!");
  await shutdown();
}

main().catch(console.error);
