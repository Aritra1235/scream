import neo4j, { type Driver, type Session } from 'neo4j-driver'

let driver: Driver | null = null

/**
 * Returns a lazily-initialised Neo4j driver.
 * If NEO4J_URI is not configured the function returns null so that callers
 * can gracefully skip graph operations without crashing.
 */
export function getNeo4jDriver(): Driver | null {
    if (driver) return driver

    const uri = Bun.env.NEO4J_URI
    const user = Bun.env.NEO4J_USER ?? 'neo4j'
    const password = Bun.env.NEO4J_PASSWORD

    if (!uri || !password) {
        console.warn('[Neo4j] NEO4J_URI / NEO4J_PASSWORD not set – graph features disabled')
        return null
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 5000,
    })

    return driver
}

/**
 * Runs a Cypher write query in an auto-closing session.
 * Failures are logged but not re-thrown so that primary PostgreSQL writes
 * are never blocked by a Neo4j outage.
 */
export async function neo4jWrite(
    cypher: string,
    params: Record<string, unknown> = {}
): Promise<void> {
    const d = getNeo4jDriver()
    if (!d) return

    let session: Session | null = null
    try {
        session = d.session({ defaultAccessMode: neo4j.session.WRITE })
        await session.run(cypher, params)
    } catch (err) {
        console.error('[Neo4j] Write error:', err)
    } finally {
        await session?.close()
    }
}

/**
 * Runs a Cypher read query and returns the raw records.
 * Returns an empty array when Neo4j is not configured.
 */
export async function neo4jRead(
    cypher: string,
    params: Record<string, unknown> = {}
) {
    const d = getNeo4jDriver()
    if (!d) return []

    let session: Session | null = null
    try {
        session = d.session({ defaultAccessMode: neo4j.session.READ })
        const result = await session.run(cypher, params)
        return result.records
    } catch (err) {
        console.error('[Neo4j] Read error:', err)
        return []
    } finally {
        await session?.close()
    }
}

/**
 * Verifies connectivity and creates uniqueness constraints on first startup.
 * Safe to call multiple times – Neo4j's CREATE CONSTRAINT IF NOT EXISTS is idempotent.
 */
export async function initNeo4j(): Promise<void> {
    const d = getNeo4jDriver()
    if (!d) return

    try {
        await d.verifyConnectivity()
        console.log('[Neo4j] Connected successfully')
    } catch (err) {
        console.error('[Neo4j] Failed to connect:', err)
        return
    }

    // Create constraints (idempotent)
    const constraints = [
        'CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE',
        'CREATE CONSTRAINT post_id IF NOT EXISTS FOR (p:Post) REQUIRE p.id IS UNIQUE',
    ]

    for (const cypher of constraints) {
        await neo4jWrite(cypher)
    }
}

/**
 * Closes the driver on graceful shutdown.
 */
export async function closeNeo4j(): Promise<void> {
    if (driver) {
        await driver.close()
        driver = null
    }
}
