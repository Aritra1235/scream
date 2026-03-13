import { neo4jRead } from '../../db/neo4j'
import { db } from '../../db/client'
import { user, follows } from '../../db/schema'
import { eq, and, notInArray, inArray } from 'drizzle-orm'
import { config } from '../../config'

/**
 * "Who to follow" – users connected through mutual follows (Neo4j).
 * Falls back to a simple PostgreSQL-based query when Neo4j is unavailable.
 */
export async function getFollowSuggestions(userId: string, limit = 10) {
    // ── Neo4j graph traversal ────────────────────────────────────────────────
    const records = await neo4jRead(
        `MATCH (me:User {id: $userId})-[:FOLLOWS]->(friend:User)-[:FOLLOWS]->(suggestion:User)
         WHERE NOT (me)-[:FOLLOWS]->(suggestion)
           AND suggestion.id <> $userId
         RETURN suggestion.id AS id, suggestion.username AS username,
                count(friend) AS mutualCount
         ORDER BY mutualCount DESC
         LIMIT $limit`,
        { userId, limit }
    )

    if (records.length > 0) {
        const ids = records.map((r) => r.get('id') as string)
        const users = await db
            .select({
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                avatar_url: user.avatar_url,
                verified: user.verified,
                followers_count: user.followers_count,
            })
            .from(user)
            .where(inArray(user.id, ids.map(BigInt)))

        // Build a lookup map then order by Neo4j ranking
        const map = new Map(users.map((u) => [u.id.toString(), u]))
        return ids
            .map((id) => {
                const u = map.get(id)
                if (!u) return null
                const mutualCount = Number(records.find((r) => r.get('id') === id)?.get('mutualCount') ?? 0)
                return {
                    id: u.id.toString(),
                    username: u.username,
                    display_name: u.display_name,
                    avatar_url: u.avatar_url ? `${config.cdn.baseUrl}/${u.avatar_url}` : null,
                    verified: u.verified,
                    followers_count: u.followers_count,
                    mutual_count: mutualCount,
                }
            })
            .filter(Boolean)
    }

    // ── PostgreSQL fallback – popular users not yet followed ─────────────────
    return await getFallbackSuggestions(userId, limit)
}

async function getFallbackSuggestions(userId: string, limit: number) {
    // Find users already followed
    const alreadyFollowing = await db
        .select({ id: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, BigInt(userId)))

    const followedIds = alreadyFollowing.map((r) => r.id)
    const excluded = [BigInt(userId), ...followedIds]

    const candidates = await db
        .select({
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
            followers_count: user.followers_count,
        })
        .from(user)
        .where(
            and(
                notInArray(user.id, excluded),
                eq(user.onboarded, true),
                eq(user.emailVerified, true)
            )
        )
        .orderBy(user.followers_count)
        .limit(limit)

    return candidates.map((u) => ({
        id: u.id.toString(),
        username: u.username,
        display_name: u.display_name,
        avatar_url: u.avatar_url ? `${config.cdn.baseUrl}/${u.avatar_url}` : null,
        verified: u.verified,
        followers_count: u.followers_count,
        mutual_count: 0,
    }))
}

/**
 * Returns user IDs (strings) that the given user follows, sourced from Neo4j.
 * Used to power the graph-aware home feed.
 */
export async function getFollowingIds(userId: string): Promise<string[]> {
    const records = await neo4jRead(
        `MATCH (me:User {id: $userId})-[:FOLLOWS]->(followed:User)
         RETURN followed.id AS id`,
        { userId }
    )

    if (records.length > 0) {
        return records.map((r) => r.get('id') as string)
    }

    // Fallback: fetch from PostgreSQL
    const rows = await db
        .select({ id: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, BigInt(userId)))

    return rows.map((r) => r.id.toString())
}
