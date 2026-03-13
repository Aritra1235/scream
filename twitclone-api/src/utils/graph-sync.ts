import { getSession } from "./neo4j";
import { db } from "../db/client";
import { user as userTable, follows as followsTable, posts as postsTable, likes as likesTable } from "../db/schema";

export async function syncUserToGraph(userId: string, username: string | null, displayName: string | null): Promise<void> {
    const session = getSession();
    try {
        await session.run(
            `MERGE (u:User {id: $id})
             SET u.username = $username, u.displayName = $displayName, u.updatedAt = datetime()`,
            { id: userId, username: username || "", displayName: displayName || "" }
        );
    } finally {
        await session.close();
    }
}

export async function syncFollowToGraph(followerId: string, followingId: string): Promise<void> {
    const session = getSession();
    try {
        await session.run(
            `MERGE (a:User {id: $followerId})
             MERGE (b:User {id: $followingId})
             MERGE (a)-[r:FOLLOWS]->(b)
             SET r.createdAt = datetime()`,
            { followerId, followingId }
        );
    } finally {
        await session.close();
    }
}

export async function removeFollowFromGraph(followerId: string, followingId: string): Promise<void> {
    const session = getSession();
    try {
        await session.run(
            `MATCH (a:User {id: $followerId})-[r:FOLLOWS]->(b:User {id: $followingId})
             DELETE r`,
            { followerId, followingId }
        );
    } finally {
        await session.close();
    }
}

export async function syncPostToGraph(postId: string, userId: string): Promise<void> {
    const session = getSession();
    try {
        await session.run(
            `MERGE (u:User {id: $userId})
             MERGE (p:Post {id: $postId})
             MERGE (u)-[r:POSTED]->(p)
             SET p.createdAt = datetime()`,
            { userId, postId }
        );
    } finally {
        await session.close();
    }
}

export async function syncLikeToGraph(userId: string, postId: string): Promise<void> {
    const session = getSession();
    try {
        await session.run(
            `MERGE (u:User {id: $userId})
             MERGE (p:Post {id: $postId})
             MERGE (u)-[r:LIKED]->(p)
             SET r.createdAt = datetime()`,
            { userId, postId }
        );
    } finally {
        await session.close();
    }
}

export async function removeLikeFromGraph(userId: string, postId: string): Promise<void> {
    const session = getSession();
    try {
        await session.run(
            `MATCH (u:User {id: $userId})-[r:LIKED]->(p:Post {id: $postId})
             DELETE r`,
            { userId, postId }
        );
    } finally {
        await session.close();
    }
}

export async function seedGraphFromPostgres(): Promise<void> {
    console.log("[graph-sync] Seeding Neo4j from PostgreSQL...");
    const neo = getSession();
    try {
        const users = await db.select({
            id: userTable.id,
            username: userTable.username,
            display_name: userTable.display_name,
        }).from(userTable);

        for (const u of users) {
            await neo.run(
                `MERGE (user:User {id: $id})
                 SET user.username = $username, user.displayName = $displayName`,
                { id: u.id.toString(), username: u.username || "", displayName: u.display_name || "" }
            );
        }
        console.log(`[graph-sync] Synced ${users.length} users`);

        const followRows = await db.select().from(followsTable);
        for (const f of followRows) {
            await neo.run(
                `MERGE (a:User {id: $followerId})
                 MERGE (b:User {id: $followingId})
                 MERGE (a)-[:FOLLOWS]->(b)`,
                { followerId: f.followerId.toString(), followingId: f.followingId.toString() }
            );
        }
        console.log(`[graph-sync] Synced ${followRows.length} follow relationships`);

        const postRows = await db.select({
            id: postsTable.id,
            userId: postsTable.userId,
        }).from(postsTable);

        for (const p of postRows) {
            await neo.run(
                `MERGE (u:User {id: $userId})
                 MERGE (p:Post {id: $postId})
                 MERGE (u)-[:POSTED]->(p)`,
                { userId: p.userId.toString(), postId: p.id.toString() }
            );
        }
        console.log(`[graph-sync] Synced ${postRows.length} posts`);

        const likeRows = await db.select().from(likesTable);
        for (const l of likeRows) {
            await neo.run(
                `MERGE (u:User {id: $userId})
                 MERGE (p:Post {id: $postId})
                 MERGE (u)-[:LIKED]->(p)`,
                { userId: l.userId.toString(), postId: l.postId.toString() }
            );
        }
        console.log(`[graph-sync] Synced ${likeRows.length} likes`);

        console.log("[graph-sync] Seed complete");
    } catch (err) {
        console.error("[graph-sync] Seed failed:", err);
    } finally {
        await neo.close();
    }
}
