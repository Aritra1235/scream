import { db } from '../../db/client';
import { posts, user, likes } from '../../db/schema';
import { eq, desc, sql, and, isNull } from 'drizzle-orm';

interface SimpleFeedPost {
    id: string;
    content: string;
    createdAt: Date;
    mediaCount: number;
    author: {
        id: string;
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
        verified: boolean;
    };
    engagement: {
        likes: number;
        reposts: number;
        replies: number;
        liked_by_user: boolean;
    };
}

async function getSimpleFeed(limit: number = 20, offset: number = 0, currentUserId?: string): Promise<SimpleFeedPost[]> {
    try {
        // Get posts with author info first
        const postsWithAuthors = await db.select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            mediaCount: posts.mediaCount,
            userId: posts.userId,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
        })
            .from(posts)
            .innerJoin(user, eq(posts.userId, user.id))
            .where(isNull(posts.parentId)) // Only show top-level posts, not replies
            .orderBy(desc(posts.createdAt)) // Latest first
            .limit(limit)
            .offset(offset);

        // Get engagement counts for each post
        const postsWithEngagement = await Promise.all(
            postsWithAuthors.map(async (post) => {
                const [likeCount] = await db.select({ count: sql<number>`count(*)` })
                    .from(likes)
                    .where(eq(likes.postId, post.id));

                const [repostCount] = await db.select({ count: sql<number>`count(*)` })
                    .from(posts)
                    .where(and(eq(posts.repostOf, post.id), isNull(posts.parentId)));

                const [replyCount] = await db.select({ count: sql<number>`count(*)` })
                    .from(posts)
                    .where(eq(posts.parentId, post.id));

                let likedByUser = false;
                if (currentUserId) {
                    const [like] = await db.select()
                        .from(likes)
                        .where(and(eq(likes.postId, post.id), eq(likes.userId, BigInt(currentUserId))));
                    likedByUser = !!like;
                }

                return {
                    ...post,
                    likeCount: likeCount.count || 0,
                    repostCount: repostCount.count || 0,
                    replyCount: replyCount.count || 0,
                    likedByUser,
                };
            })
        );

        return postsWithEngagement.map(post => ({
            id: post.id.toString(),
            content: post.content,
            createdAt: post.createdAt,
            mediaCount: post.mediaCount,
            author: {
                id: post.userId.toString(),
                username: post.username,
                display_name: post.display_name,
                avatar_url: post.avatar_url,
                verified: post.verified,
            },
            engagement: {
                likes: post.likeCount,
                reposts: post.repostCount,
                replies: post.replyCount,
                liked_by_user: post.likedByUser,
            },
        }));
    } catch (error) {
        console.error('Error fetching feed:', error);
        throw new Error('Failed to fetch feed');
    }
}

async function getUserFeed(username: string, limit: number = 20, offset: number = 0, currentUserId?: string): Promise<SimpleFeedPost[]> {
    try {
        const postsWithAuthors = await db.select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            mediaCount: posts.mediaCount,
            userId: posts.userId,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
        })
            .from(posts)
            .innerJoin(user, eq(posts.userId, user.id))
            .where(and(eq(user.username, username), isNull(posts.parentId)))
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset);

        const postsWithEngagement = await Promise.all(
            postsWithAuthors.map(async (post) => {
                const [likeCount] = await db.select({ count: sql<number>`count(*)` })
                    .from(likes)
                    .where(eq(likes.postId, post.id));

                const [repostCount] = await db.select({ count: sql<number>`count(*)` })
                    .from(posts)
                    .where(and(eq(posts.repostOf, post.id), isNull(posts.parentId)));

                const [replyCount] = await db.select({ count: sql<number>`count(*)` })
                    .from(posts)
                    .where(eq(posts.parentId, post.id));

                let likedByUser = false;
                if (currentUserId) {
                    const [like] = await db.select()
                        .from(likes)
                        .where(and(eq(likes.postId, post.id), eq(likes.userId, BigInt(currentUserId))));
                    likedByUser = !!like;
                }

                return {
                    ...post,
                    likeCount: likeCount.count || 0,
                    repostCount: repostCount.count || 0,
                    replyCount: replyCount.count || 0,
                    likedByUser,
                };
            })
        );

        return postsWithEngagement.map(post => ({
            id: post.id.toString(),
            content: post.content,
            createdAt: post.createdAt,
            mediaCount: post.mediaCount,
            author: {
                id: post.userId.toString(),
                username: post.username,
                display_name: post.display_name,
                avatar_url: post.avatar_url,
                verified: post.verified,
            },
            engagement: {
                likes: post.likeCount,
                reposts: post.repostCount,
                replies: post.replyCount,
                liked_by_user: post.likedByUser,
            },
        }));
    } catch (error) {
        console.error('Error fetching user feed:', error);
        throw new Error('Failed to fetch user feed');
    }
}

export { getSimpleFeed, getUserFeed, type SimpleFeedPost };