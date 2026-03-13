import { db } from '../../db/client';
import { posts, user, likes, media } from '../../db/schema';
import { eq, desc, sql, and, isNull, inArray } from 'drizzle-orm';
import { getFollowingIds } from '../suggestions/services';

type MediaItem = {
    mediaUrl: string;
    type: string;
    width: number | null;
    height: number | null;
    contentType: string;
};

type Author = {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    verified: boolean;
};

type Engagement = {
    likes: number;
    reposts: number;
    replies: number;
    liked_by_user: boolean;
};

export type FeedPost = {
    id: string;
    content: string;
    createdAt: Date;
    mediaCount: number;
    media: MediaItem[];
    author: Author;
    engagement: Engagement;
    parentId?: string | null;
    repostOf?: Omit<FeedPost, 'repostOf' | 'replies' | 'parentId'>;
    replies?: FeedPost[];
};

type DbPostWithAuthor = {
    id: bigint;
    content: string;
    createdAt: Date;
    mediaCount: number;
    userId: bigint;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    verified: boolean;
    parentId: bigint | null;
    repostOf: bigint | null;
};

async function getEngagement(postId: bigint, currentUserId?: string): Promise<Engagement> {
    const [likeCount] = await db.select({ count: sql<number>`count(*)` })
        .from(likes)
        .where(eq(likes.postId, postId));

    const [repostCount] = await db.select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(eq(posts.repostOf, postId));

    const [replyCount] = await db.select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(eq(posts.parentId, postId));

    let likedByUser = false;
    if (currentUserId) {
        const [like] = await db.select()
            .from(likes)
            .where(and(eq(likes.postId, postId), eq(likes.userId, BigInt(currentUserId))));
        likedByUser = !!like;
    }

    return {
        likes: likeCount?.count || 0,
        reposts: repostCount?.count || 0,
        replies: replyCount?.count || 0,
        liked_by_user: likedByUser,
    };
}

async function getMediaForPost(postId: bigint): Promise<MediaItem[]> {
    const mediaRows = await db
        .select()
        .from(media)
        .where(and(eq(media.targetType, 'post'), eq(media.targetId, postId)))
        .orderBy(desc(media.createdAt));

    return mediaRows.map((item) => ({
        mediaUrl: item.mediaUrl,
        type: item.type,
        width: item.width,
        height: item.height,
        contentType: item.contentType,
    }));
}

async function getPostRow(postId: bigint): Promise<DbPostWithAuthor | null> {
    const [row] = await db
        .select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            mediaCount: posts.mediaCount,
            userId: posts.userId,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
            parentId: posts.parentId,
            repostOf: posts.repostOf,
        })
        .from(posts)
        .innerJoin(user, eq(posts.userId, user.id))
        .where(eq(posts.id, postId));

    return row || null;
}

async function buildFeedPost(
    row: DbPostWithAuthor,
    currentUserId?: string,
    depth: number = 0,
    maxDepth: number = 3
): Promise<FeedPost> {
    const [engagement, mediaItems] = await Promise.all([
        getEngagement(row.id, currentUserId),
        getMediaForPost(row.id),
    ]);

    let repostOfPost: FeedPost['repostOf'];
    if (row.repostOf) {
        const repostRow = await getPostRow(row.repostOf);
        if (repostRow) {
            // do not recurse infinitely; stop at one level for repost targets
            repostOfPost = await buildFeedPost(repostRow, currentUserId, maxDepth, maxDepth);
        }
    }

    let replies: FeedPost[] | undefined;
    if (depth < maxDepth) {
        replies = await getReplies(row.id, currentUserId, depth + 1, maxDepth);
    }

    return {
        id: row.id.toString(),
        content: row.content,
        createdAt: row.createdAt,
        mediaCount: row.mediaCount,
        media: mediaItems,
        author: {
            id: row.userId.toString(),
            username: row.username,
            display_name: row.display_name,
            avatar_url: row.avatar_url,
            verified: row.verified,
        },
        engagement,
        parentId: row.parentId ? row.parentId.toString() : null,
        repostOf: repostOfPost,
        replies,
    };
}

async function getReplies(
    parentId: bigint,
    currentUserId?: string,
    depth: number = 1,
    maxDepth: number = 3
): Promise<FeedPost[]> {
    const replyRows = await db
        .select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            mediaCount: posts.mediaCount,
            userId: posts.userId,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
            parentId: posts.parentId,
            repostOf: posts.repostOf,
        })
        .from(posts)
        .innerJoin(user, eq(posts.userId, user.id))
        .where(eq(posts.parentId, parentId))
        .orderBy(desc(posts.createdAt));

    const results: FeedPost[] = [];
    for (const row of replyRows) {
        const reply = await buildFeedPost(row, currentUserId, depth, maxDepth);
        results.push(reply);
    }
    return results;
}

async function getSimpleFeed(limit: number = 20, offset: number = 0, currentUserId?: string): Promise<FeedPost[]> {
    try {
        const rows = await db.select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            mediaCount: posts.mediaCount,
            userId: posts.userId,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
            parentId: posts.parentId,
            repostOf: posts.repostOf,
        })
            .from(posts)
            .innerJoin(user, eq(posts.userId, user.id))
            .where(isNull(posts.parentId)) // Only show top-level posts
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset);

        const feed: FeedPost[] = [];
        for (const row of rows) {
            const item = await buildFeedPost(row, currentUserId, 0, 0); // no replies in main feed
            feed.push(item);
        }
        return feed;
    } catch (error) {
        console.error('Error fetching feed:', error);
        throw new Error('Failed to fetch feed');
    }
}

async function getUserFeed(username: string, limit: number = 20, offset: number = 0, currentUserId?: string): Promise<FeedPost[]> {
    try {
        const rows = await db.select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            mediaCount: posts.mediaCount,
            userId: posts.userId,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
            parentId: posts.parentId,
            repostOf: posts.repostOf,
        })
            .from(posts)
            .innerJoin(user, eq(posts.userId, user.id))
            .where(and(eq(user.username, username), isNull(posts.parentId)))
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset);

        const feed: FeedPost[] = [];
        for (const row of rows) {
            const item = await buildFeedPost(row, currentUserId, 0, 0);
            feed.push(item);
        }
        return feed;
    } catch (error) {
        console.error('Error fetching user feed:', error);
        throw new Error('Failed to fetch user feed');
    }
}

async function getPostWithThread(postId: string, currentUserId?: string): Promise<FeedPost | null> {
    let postBigInt: bigint;
    try {
        postBigInt = BigInt(postId);
    } catch (error) {
        return null;
    }

    const row = await getPostRow(postBigInt);
    if (!row) {
        return null;
    }
    const post = await buildFeedPost(row, currentUserId, 0, 3);
    return post;
}

/**
 * Graph-powered home feed: returns posts exclusively from users that the
 * current user follows, ordered by recency.  Post IDs are sourced from the
 * Neo4j social graph (with a PostgreSQL fallback) and full post data is then
 * fetched from PostgreSQL.
 */
async function getFollowingFeed(currentUserId: string, limit: number = 20, offset: number = 0): Promise<FeedPost[]> {
    try {
        const followingIds = await getFollowingIds(currentUserId);

        if (followingIds.length === 0) {
            return [];
        }

        const rows = await db.select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            mediaCount: posts.mediaCount,
            userId: posts.userId,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            verified: user.verified,
            parentId: posts.parentId,
            repostOf: posts.repostOf,
        })
            .from(posts)
            .innerJoin(user, eq(posts.userId, user.id))
            .where(
                and(
                    inArray(posts.userId, followingIds.map(BigInt)),
                    isNull(posts.parentId)
                )
            )
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset);

        const feed: FeedPost[] = [];
        for (const row of rows) {
            const item = await buildFeedPost(row, currentUserId, 0, 0);
            feed.push(item);
        }
        return feed;
    } catch (error) {
        console.error('Error fetching following feed:', error);
        throw new Error('Failed to fetch following feed');
    }
}

export { getSimpleFeed, getUserFeed, getPostWithThread, getFollowingFeed, type FeedPost };