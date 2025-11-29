import { createPostSchema, repostPostSchema, deletePostSchema } from './modals';
import { db } from '../../db/client';
import { posts, user } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateId } from '../../utils/snowflake';

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
        return post;
    } catch (error) {
        // Log the actual error for debugging
        console.error('Database error:', error);
        // Throw a sanitized error without exposing internals
        throw new Error('Failed to create post');
    }
}


async function repostPost(userId: bigint, repostOf: bigint) {
    const post = await db.insert(posts).values({
        id: generateId(),
        userId,
        repostOf,
    }).returning();
    if(!post) {
        throw new Error('Failed to repost post');
    }
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

export { createPost, repostPost, deletePost, isPostOwner };