import { createPostSchema, repostPostSchema, deletePostSchema } from './modals';
import { db } from '../../db/client';
import { posts } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '../../utils/snowflake';

async function createPost(userId: bigint, content: string, mediaCount: number) {
    const post = await db.insert(posts).values({
        id: generateId(),
        userId,
        content,
        mediaCount,
    }).returning();
    if(!post) {
        throw new Error('Failed to create post');
    }
    return post;
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