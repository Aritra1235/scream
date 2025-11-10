import { config } from '../../config';
import { db } from '../../db/client';
import { likes, posts, user } from '../../db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

type PostLikeUser = {
    userId: string;
    username: string | null;
    displayName: string | null;
    avatar_url: string | null;
    verified: boolean;
};


async function likePost(userId: bigint, postId: bigint) {
    return await db.transaction(async (tx) => {
        const [like] = await tx.insert(likes)
            .values({ userId, postId })
            .returning();
        
        if (!like) {
            throw new Error('Failed to like post');
        }
        
        const [updatedPost] = await tx.update(posts)
            .set({ likes_count: sql`${posts.likes_count} + 1` })
            .where(eq(posts.id, postId))
            .returning();
        
        if (!updatedPost) {
            throw new Error('Failed to update post');
        }
        
        return { ...like, ...updatedPost };
    });
}


async function unlikePost(userId: bigint, postId: bigint) {
    return await db.transaction(async (tx) => {
        const unlike = await tx.delete(likes)
            .where(and(
                eq(likes.userId, userId),
                eq(likes.postId, postId)
            ))
            .returning();
        
        if (unlike.length === 0) {
            throw new Error('Like not found - user has not liked this post');
        }
        
        const [updatedPost] = await tx.update(posts)
            .set({ likes_count: sql`${posts.likes_count} - 1` })
            .where(eq(posts.id, postId))
            .returning();
        
        if (!updatedPost) {
            throw new Error('Failed to update post');
        }
        
        return { unlike: unlike[0], post: updatedPost };
    });
}

async function getPostLikesCount(postId: bigint): Promise<number> {
    const [post] = await db
        .select({ count: posts.likes_count })
        .from(posts)
        .where(eq(posts.id, postId));
    
    if (!post) {
        throw new Error('Post not found');
    }
    
    return post.count;
}




async function getPostLikes(
    postId: bigint, 
    limit: number = 50, 
    offset: number = 0
): Promise<PostLikeUser[]> {
    const result = await db
        .select({
            userId: user.id,
            username: user.username,
            displayName: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
        })
        .from(likes)
        .innerJoin(user, eq(likes.userId, user.id))
        .where(eq(likes.postId, postId))
        .orderBy(desc(likes.createdAt))
        .limit(limit)
        .offset(offset);
    
    // Convert BigInt to string for JSON serialization
    return result.map(row => ({
        ...row,
        avatar_url: config.cdn.baseUrl+"/" + row.avatar_url,
        userId: row.userId.toString()
    }));
}





export { likePost, unlikePost, getPostLikesCount, getPostLikes };