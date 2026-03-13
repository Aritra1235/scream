import neo4j, { type Driver, type Session } from "neo4j-driver";

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
    if (!driver) {
        const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
        const user = process.env.NEO4J_USER || "neo4j";
        const password = process.env.NEO4J_PASSWORD || "neo4jdev";
        driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    }
    return driver;
}

export function getSession(): Session {
    return getNeo4jDriver().session();
}

export async function initNeo4jSchema(): Promise<void> {
    const session = getSession();
    try {
        await session.run(
            "CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE"
        );
        await session.run(
            "CREATE CONSTRAINT post_id IF NOT EXISTS FOR (p:Post) REQUIRE p.id IS UNIQUE"
        );
        await session.run(
            "CREATE INDEX user_username IF NOT EXISTS FOR (u:User) ON (u.username)"
        );
        console.log("[neo4j] Schema constraints and indexes initialized");
    } catch (err) {
        console.error("[neo4j] Failed to initialize schema:", err);
    } finally {
        await session.close();
    }
}

export async function closeNeo4j(): Promise<void> {
    if (driver) {
        await driver.close();
        driver = null;
    }
}
