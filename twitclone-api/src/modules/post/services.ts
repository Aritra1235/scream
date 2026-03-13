import { db } from '../../db/client';
import { posts, user } from '../../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { generateId } from '../../utils/snowflake';
import { getUserIdByUsername } from '../common';
import { syncPostToGraph } from '../../utils/graph-sync';

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
        syncPostToGraph(post[0].id.toString(), userId.toString()).catch((err) =>
            console.error("[graph-sync] post sync failed:", err)
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
    return post;
}

async function deletePost(postId: bigint) {
    const post = await db.delete(posts).where(eq(posts.id, postId)).returning();
    if(!post) {
        throw new Error('Failed to delete post');
    }
    await db.update(user).set({ posts_count: sql`${user.posts_count} - 1` }).where(eq(user.id, post[0].userId));
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