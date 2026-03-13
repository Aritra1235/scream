import { db } from '../../db/client'
import { follows, user } from '../../db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import { neo4jWrite, neo4jRead } from '../../db/neo4j'
import { config } from '../../config'

// ─── Follow ──────────────────────────────────────────────────────────────────

export async function followUser(followerId: bigint, followingId: bigint) {
    if (followerId === followingId) {
        throw new Error('Cannot follow yourself')
    }

    const [target] = await db.select({ id: user.id }).from(user).where(eq(user.id, followingId))
    if (!target) throw new Error('User not found')

    await db.transaction(async (tx) => {
        await tx.insert(follows).values({ followerId, followingId })
        await tx.update(user)
            .set({ followers_count: sql`${user.followers_count} + 1` })
            .where(eq(user.id, followingId))
        await tx.update(user)
            .set({ following_count: sql`${user.following_count} + 1` })
            .where(eq(user.id, followerId))
    })

    // Sync to Neo4j (non-blocking)
    void neo4jWrite(
        `MATCH (a:User {id: $followerId}), (b:User {id: $followingId})
         MERGE (a)-[:FOLLOWS {since: datetime()}]->(b)`,
        { followerId: followerId.toString(), followingId: followingId.toString() }
    )
}

// ─── Unfollow ─────────────────────────────────────────────────────────────────

export async function unfollowUser(followerId: bigint, followingId: bigint) {
    await db.transaction(async (tx) => {
        const deleted = await tx.delete(follows)
            .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
            .returning()

        if (deleted.length === 0) throw new Error('Follow relationship not found')

        await tx.update(user)
            .set({ followers_count: sql`${user.followers_count} - 1` })
            .where(eq(user.id, followingId))
        await tx.update(user)
            .set({ following_count: sql`${user.following_count} - 1` })
            .where(eq(user.id, followerId))
    })

    // Sync to Neo4j (non-blocking)
    void neo4jWrite(
        `MATCH (a:User {id: $followerId})-[r:FOLLOWS]->(b:User {id: $followingId})
         DELETE r`,
        { followerId: followerId.toString(), followingId: followingId.toString() }
    )
}

// ─── Check if following ───────────────────────────────────────────────────────

export async function isFollowing(followerId: bigint, followingId: bigint): Promise<boolean> {
    const [row] = await db
        .select({ followerId: follows.followerId })
        .from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
    return !!row
}

// ─── Followers list ───────────────────────────────────────────────────────────

export async function getFollowers(userId: bigint, limit = 20, offset = 0) {
    const rows = await db
        .select({
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
        })
        .from(follows)
        .innerJoin(user, eq(follows.followerId, user.id))
        .where(eq(follows.followingId, userId))
        .orderBy(desc(follows.createdAt))
        .limit(limit)
        .offset(offset)

    return rows.map((r) => ({
        ...r,
        id: r.id.toString(),
        avatar_url: r.avatar_url ? `${config.cdn.baseUrl}/${r.avatar_url}` : null,
    }))
}

// ─── Following list ───────────────────────────────────────────────────────────

export async function getFollowing(userId: bigint, limit = 20, offset = 0) {
    const rows = await db
        .select({
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
        })
        .from(follows)
        .innerJoin(user, eq(follows.followingId, user.id))
        .where(eq(follows.followerId, userId))
        .orderBy(desc(follows.createdAt))
        .limit(limit)
        .offset(offset)

    return rows.map((r) => ({
        ...r,
        id: r.id.toString(),
        avatar_url: r.avatar_url ? `${config.cdn.baseUrl}/${r.avatar_url}` : null,
    }))
}

// ─── Mutual followers (Neo4j) ────────────────────────────────────────────────
// Returns users who both the current user AND the target user follow.

export async function getMutualFollowers(userId: string, targetUserId: string, limit = 20) {
    const records = await neo4jRead(
        `MATCH (me:User {id: $userId})-[:FOLLOWS]->(mutual:User)<-[:FOLLOWS]-(target:User {id: $targetUserId})
         RETURN mutual.id AS id, mutual.username AS username
         LIMIT $limit`,
        { userId, targetUserId, limit: neo4jInt(limit) }
    )

    return records.map((r) => ({
        id: r.get('id') as string,
        username: r.get('username') as string,
    }))
}

// Helpers
function neo4jInt(n: number) {
    // neo4j-driver v6 accepts plain JS numbers for integer parameters
    return n
}
