import { db, client } from "../src/db/client";
import { getNeo4jDriver, getSession as getNeo4jSession, closeNeo4j } from "../src/utils/neo4j";

export { db, client };
export { getNeo4jDriver, getNeo4jSession, closeNeo4j };

export function bigintSerializer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

export function log(msg: string) {
  console.log(`[script] ${msg}`);
}

export function logTable(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    console.log("  (no results)");
    return;
  }
  const serialized = rows.map((r) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) {
      out[k] = typeof v === "bigint" ? v.toString() : v;
    }
    return out;
  });
  console.table(serialized);
}

export function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const [key, ...rest] = arg.slice(2).split("=");
      args[key] = rest.length ? rest.join("=") : argv[++i] || "true";
    } else {
      args[`_${Object.keys(args).length}`] = arg;
    }
  }
  return args;
}

export async function shutdown() {
  try { await closeNeo4j(); } catch {}
  try { await client.end(); } catch {}
}
