import { getSession as getNeo4jSession } from "../../utils/neo4j";
import { db } from "../../db/client";
import { user } from "../../db/schema";
import { eq, inArray } from "drizzle-orm";
import { config } from "../../config";

interface SuggestedUser {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    verified: boolean;
    followers_count: number;
    following_count: number;
    mutualCount: number;
}

interface MutualFollower {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    verified: boolean;
}

interface TrendingUser {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    verified: boolean;
    followers_count: number;
    following_count: number;
    score: number;
}

export async function getWhoToFollow(
    currentUserId: string,
    limit: number = 5
): Promise<SuggestedUser[]> {
    const session = getNeo4jSession();
    try {
        const result = await session.run(
            `MATCH (me:User {id: $userId})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(suggestion)
             WHERE suggestion.id <> $userId
               AND NOT (me)-[:FOLLOWS]->(suggestion)
             RETURN suggestion.id AS id, count(DISTINCT friend) AS mutualCount
             ORDER BY mutualCount DESC
             LIMIT $limit`,
            { userId: currentUserId, limit: neo4jInt(limit) }
        );

        const suggestions = result.records.map((r) => ({
            id: r.get("id") as string,
            mutualCount: toNumber(r.get("mutualCount")),
        }));

        if (suggestions.length === 0) {
            return getPopularUsers(currentUserId, limit);
        }

        return enrichUsers(suggestions);
    } catch (err) {
        console.error("[graph] getWhoToFollow error:", err);
        return getPopularUsers(currentUserId, limit);
    } finally {
        await session.close();
    }
}

async function getPopularUsers(
    currentUserId: string,
    limit: number
): Promise<SuggestedUser[]> {
    const session = getNeo4jSession();
    try {
        const result = await session.run(
            `MATCH (u:User)
             WHERE u.id <> $userId
               AND NOT EXISTS { MATCH (:User {id: $userId})-[:FOLLOWS]->(u) }
             OPTIONAL MATCH (follower)-[:FOLLOWS]->(u)
             RETURN u.id AS id, count(follower) AS followerCount
             ORDER BY followerCount DESC
             LIMIT $limit`,
            { userId: currentUserId, limit: neo4jInt(limit) }
        );

        const users = result.records.map((r) => ({
            id: r.get("id") as string,
            mutualCount: 0,
        }));

        return enrichUsers(users);
    } finally {
        await session.close();
    }
}

export async function getMutualFollowers(
    currentUserId: string,
    targetUserId: string,
    limit: number = 10
): Promise<MutualFollower[]> {
    const session = getNeo4jSession();
    try {
        const result = await session.run(
            `MATCH (me:User {id: $currentUserId})-[:FOLLOWS]->(mutual)-[:FOLLOWS]->(target:User {id: $targetUserId})
             WHERE mutual.id <> $currentUserId AND mutual.id <> $targetUserId
             RETURN mutual.id AS id
             LIMIT $limit`,
            { currentUserId, targetUserId, limit: neo4jInt(limit) }
        );

        const ids = result.records.map((r) => r.get("id") as string);
        if (ids.length === 0) return [];

        const rows = await db
            .select({
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                avatar_url: user.avatar_url,
                verified: user.verified,
            })
            .from(user)
            .where(inArray(user.id, ids.map((id) => BigInt(id))));

        return rows.map((r) => ({
            id: r.id.toString(),
            username: r.username,
            display_name: r.display_name,
            avatar_url: r.avatar_url ? config.cdn.baseUrl + "/" + r.avatar_url : null,
            verified: r.verified,
        }));
    } catch (err) {
        console.error("[graph] getMutualFollowers error:", err);
        return [];
    } finally {
        await session.close();
    }
}

export async function getTrendingUsers(
    currentUserId: string | null,
    limit: number = 10
): Promise<TrendingUser[]> {
    const session = getNeo4jSession();
    try {
        const result = await session.run(
            `MATCH (u:User)
             WHERE u.username <> ""
             OPTIONAL MATCH (follower)-[:FOLLOWS]->(u)
             OPTIONAL MATCH (u)-[:POSTED]->(p:Post)
             OPTIONAL MATCH ()-[:LIKED]->(p)
             WITH u,
                  count(DISTINCT follower) AS followers,
                  count(DISTINCT p) AS postCount,
                  followers * 3 + postCount AS score
             ORDER BY score DESC
             LIMIT $limit
             RETURN u.id AS id, score`,
            { limit: neo4jInt(limit) }
        );

        const users = result.records.map((r) => ({
            id: r.get("id") as string,
            mutualCount: 0,
            score: toNumber(r.get("score")),
        }));

        const enriched = await enrichUsers(users);
        return enriched.map((u, i) => ({
            ...u,
            score: users[i]?.score || 0,
        }));
    } catch (err) {
        console.error("[graph] getTrendingUsers error:", err);
        return [];
    } finally {
        await session.close();
    }
}

export async function getDegreesOfSeparation(
    userId1: string,
    userId2: string
): Promise<number | null> {
    const session = getNeo4jSession();
    try {
        const result = await session.run(
            `MATCH path = shortestPath((a:User {id: $userId1})-[:FOLLOWS*..6]->(b:User {id: $userId2}))
             RETURN length(path) AS degrees`,
            { userId1, userId2 }
        );

        if (result.records.length === 0) return null;
        return toNumber(result.records[0].get("degrees"));
    } catch (err) {
        console.error("[graph] getDegreesOfSeparation error:", err);
        return null;
    } finally {
        await session.close();
    }
}

async function enrichUsers(
    graphUsers: { id: string; mutualCount: number }[]
): Promise<SuggestedUser[]> {
    if (graphUsers.length === 0) return [];

    const ids = graphUsers.map((u) => BigInt(u.id));
    const rows = await db
        .select({
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            bio: user.bio,
            verified: user.verified,
            followers_count: user.followers_count,
            following_count: user.following_count,
        })
        .from(user)
        .where(inArray(user.id, ids));

    const userMap = new Map(rows.map((r) => [r.id.toString(), r]));

    return graphUsers
        .map((gu) => {
            const pgUser = userMap.get(gu.id);
            if (!pgUser) return null;
            return {
                id: pgUser.id.toString(),
                username: pgUser.username,
                display_name: pgUser.display_name,
                avatar_url: pgUser.avatar_url ? config.cdn.baseUrl + "/" + pgUser.avatar_url : null,
                bio: pgUser.bio,
                verified: pgUser.verified,
                followers_count: pgUser.followers_count,
                following_count: pgUser.following_count,
                mutualCount: gu.mutualCount,
            };
        })
        .filter((u): u is SuggestedUser => u !== null);
}

function neo4jInt(value: number) {
    const neo4j = require("neo4j-driver");
    return neo4j.int(value);
}

function toNumber(value: any): number {
    if (typeof value === "number") return value;
    if (value && typeof value.toNumber === "function") return value.toNumber();
    return Number(value);
}
