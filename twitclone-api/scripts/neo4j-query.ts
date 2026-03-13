import { getNeo4jSession, log, shutdown, parseArgs } from "./_bootstrap";

async function main() {
  const args = parseArgs(process.argv);
  const query = args._0 || args.query;

  if (!query) {
    console.log("Usage: bun run scripts/neo4j-query.ts '<CYPHER_QUERY>'");
    console.log("\nExamples:");
    console.log("  bun run scripts/neo4j-query.ts 'MATCH (u:User) RETURN u.username, u.id LIMIT 10'");
    console.log("  bun run scripts/neo4j-query.ts 'MATCH (a)-[r:FOLLOWS]->(b) RETURN a.username, b.username LIMIT 20'");
    console.log("  bun run scripts/neo4j-query.ts 'MATCH (u:User) RETURN count(u) AS total'");
    await shutdown();
    return;
  }

  log(`Running Cypher: ${query}`);
  const session = getNeo4jSession();
  try {
    const result = await session.run(query);
    console.log(`\nReturned ${result.records.length} record(s)\n`);

    if (result.records.length > 0) {
      const keys = result.records[0].keys;
      console.log(keys.join(" | "));
      console.log("─".repeat(keys.join(" | ").length));

      for (const record of result.records) {
        const values = keys.map((k) => {
          const val = record.get(k as string);
          if (val && typeof val === "object" && "toNumber" in val) return val.toNumber();
          if (val && typeof val === "object" && "properties" in val) return JSON.stringify(val.properties);
          return val;
        });
        console.log(values.join(" | "));
      }
    }
  } catch (e: any) {
    console.error(`Query failed: ${e.message}`);
  } finally {
    await session.close();
  }

  await shutdown();
}

main().catch(console.error);
