import { db } from '../../db/client';
import { posts, user } from '../../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { generateId } from '../../utils/snowflake';
import { getUserIdByUsername } from '../common';
import { neo4jWrite } from '../../db/neo4j';

async function createPost(userId: bigint, content: string, mediaCount: number) {
    try {
        const post = await db.insert(posts).values({
            id: generateId(),
            userId,
            content,
            mediaCount,
        }).returning();
        
        if(!post || post.length === 0) {
            throw new Error('Failed to create post');
        }
        await db.update(user).set({ posts_count: sql`${user.posts_count} + 1` }).where(eq(user.id, userId));

        // Sync to Neo4j (non-blocking)
        void neo4jWrite(
            `MERGE (u:User {id: $userId})
             CREATE (p:Post {id: $postId, createdAt: datetime()})
             CREATE (u)-[:POSTED]->(p)`,
            { userId: userId.toString(), postId: post[0].id.toString() }
        );

        return post;
    } catch (error) {
        // Log the actual error for debugging
        console.error('Database error:', error);
        // Throw a sanitized error without exposing internals
        throw new Error('Failed to create post');
    }
}

async function createReply(userId: bigint, parentId: bigint, content: string, mediaCount: number = 0) {
    const [parent] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, parentId));
    if (!parent) {
        throw new Error('Parent post not found');
    }

    const post = await db.insert(posts).values({
        id: generateId(),
        userId,
        content,
        mediaCount,
        parentId,
    }).returning();

    if (!post || post.length === 0) {
        throw new Error('Failed to create reply');
    }

    await db.update(user).set({ posts_count: sql`${user.posts_count} + 1` }).where(eq(user.id, userId));

    // Sync to Neo4j (non-blocking)
    void neo4jWrite(
        `MERGE (u:User {id: $userId})
         CREATE (p:Post {id: $postId, createdAt: datetime()})
         CREATE (u)-[:POSTED]->(p)
         WITH p
         MATCH (parent:Post {id: $parentId})
         CREATE (p)-[:REPLY_TO]->(parent)`,
        { userId: userId.toString(), postId: post[0].id.toString(), parentId: parentId.toString() }
    );

    return post;
}


async function repostPost(userId: bigint, repostOf: bigint) {
    const post = await db.insert(posts).values({
        id: generateId(),
        userId,
        content: '',
        mediaCount: 0,
        repostOf,
    }).returning();
    if(!post) {
        throw new Error('Failed to repost post');
    }

    // Sync to Neo4j (non-blocking)
    void neo4jWrite(
        `MERGE (u:User {id: $userId})
         CREATE (p:Post {id: $postId, createdAt: datetime()})
         CREATE (u)-[:POSTED]->(p)
         WITH p
         MATCH (orig:Post {id: $repostOf})
         CREATE (p)-[:REPOST_OF]->(orig)`,
        { userId: userId.toString(), postId: post[0].id.toString(), repostOf: repostOf.toString() }
    );

    return post;
}

async function createQuoteRepost(userId: bigint, repostOf: bigint, content: string, mediaCount: number = 0) {
    const [target] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, repostOf));
    if (!target) {
        throw new Error('Target post not found');
    }

    const post = await db.insert(posts).values({
        id: generateId(),
        userId,
        content,
        mediaCount,
        repostOf,
    }).returning();

    if (!post || post.length === 0) {
        throw new Error('Failed to quote repost post');
    }
    await db.update(user).set({ posts_count: sql`${user.posts_count} + 1` }).where(eq(user.id, userId));

    // Sync to Neo4j (non-blocking)
    void neo4jWrite(
        `MERGE (u:User {id: $userId})
         CREATE (p:Post {id: $postId, createdAt: datetime()})
         CREATE (u)-[:POSTED]->(p)
         WITH p
         MATCH (orig:Post {id: $repostOf})
         CREATE (p)-[:REPOST_OF]->(orig)`,
        { userId: userId.toString(), postId: post[0].id.toString(), repostOf: repostOf.toString() }
    );

    return post;
}

async function deletePost(postId: bigint) {
    const post = await db.delete(posts).where(eq(posts.id, postId)).returning();
    if(!post) {
        throw new Error('Failed to delete post');
    }
    await db.update(user).set({ posts_count: sql`${user.posts_count} - 1` }).where(eq(user.id, post[0].userId));

    // Remove from Neo4j (non-blocking)
    void neo4jWrite(
        `MATCH (p:Post {id: $postId}) DETACH DELETE p`,
        { postId: postId.toString() }
    );

    return post;
}

async function isPostOwner(postId: bigint, userId: bigint) {
    const post = await db.select().from(posts).where(and(eq(posts.id, postId), eq(posts.userId, userId)));
    if(!post) {
        return false;
    }
    return true;
}

async function getPostsByUserId(userId: bigint, limit: number = 20, offset: number = 0) {
    try {
        const userPosts = await db
            .select()
            .from(posts)
            .where(eq(posts.userId, userId))
            .orderBy(desc(posts.createdAt))   // newest first
            .limit(limit)
            .offset(offset);

        return userPosts.map(post => ({
            ...post,
            id: post.id.toString(),
            userId: post.userId.toString(),
        }));

    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Failed to get posts');
    }

}    

async function getPostsByUsername(username: string, limit: number = 20, offset: number = 0) {
    const userId = await getUserIdByUsername(username);
    if (!userId) {
        return [];
    }
    return await getPostsByUserId(BigInt(userId), limit, offset);
}

export {
    createPost,
    createReply,
    repostPost,
    createQuoteRepost,
    deletePost,
    isPostOwner,
    getPostsByUserId,
    getPostsByUsername
};