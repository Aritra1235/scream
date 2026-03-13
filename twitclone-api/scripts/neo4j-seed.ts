import { log, shutdown } from "./_bootstrap";
import { seedGraphFromPostgres } from "../src/utils/graph-sync";
import { initNeo4jSchema } from "../src/utils/neo4j";

async function main() {
  log("Seeding Neo4j from PostgreSQL...");
  await initNeo4jSchema();
  await seedGraphFromPostgres();
  log("Done!");
  await shutdown();
}

main().catch(console.error);
