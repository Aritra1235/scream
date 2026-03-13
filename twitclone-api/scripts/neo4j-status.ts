import { getNeo4jSession, log, shutdown } from "./_bootstrap";

async function main() {
  log("Neo4j graph status");
  console.log("─".repeat(50));

  const session = getNeo4jSession();
  try {
    const userCount = await session.run("MATCH (u:User) RETURN count(u) AS count");
    const postCount = await session.run("MATCH (p:Post) RETURN count(p) AS count");
    const followCount = await session.run("MATCH ()-[r:FOLLOWS]->() RETURN count(r) AS count");
    const likeCount = await session.run("MATCH ()-[r:LIKED]->() RETURN count(r) AS count");
    const postedCount = await session.run("MATCH ()-[r:POSTED]->() RETURN count(r) AS count");

    const toNum = (r: any) => {
      const val = r.records[0]?.get("count");
      return val?.toNumber ? val.toNumber() : Number(val);
    };

    console.log(`\n  Users:          ${toNum(userCount)}`);
    console.log(`  Posts:          ${toNum(postCount)}`);
    console.log(`  FOLLOWS edges:  ${toNum(followCount)}`);
    console.log(`  LIKED edges:    ${toNum(likeCount)}`);
    console.log(`  POSTED edges:   ${toNum(postedCount)}`);

    const constraints = await session.run("SHOW CONSTRAINTS");
    console.log(`\n  Constraints:    ${constraints.records.length}`);

    const indexes = await session.run("SHOW INDEXES");
    console.log(`  Indexes:        ${indexes.records.length}`);

    console.log("\n  Connection: OK");
  } catch (e: any) {
    console.log(`\n  Connection: FAILED (${e.message})`);
  } finally {
    await session.close();
  }

  await shutdown();
}

main().catch(console.error);
