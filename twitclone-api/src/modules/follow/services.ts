import { db } from "../../db/client";
import { follows, user } from "../../db/schema";
import { and, eq, sql, desc } from "drizzle-orm";
import { config } from "../../config";
import { syncFollowToGraph, removeFollowFromGraph } from "../../utils/graph-sync";

export async function followUser(followerId: bigint, followingId: bigint) {
    if (followerId === followingId) {
        throw new Error("Cannot follow yourself");
    }

    return await db.transaction(async (tx) => {
        const [existing] = await tx
            .select()
            .from(follows)
            .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));

        if (existing) {
            throw new Error("Already following this user");
        }

        await tx.insert(follows).values({ followerId, followingId });

        await tx
            .update(user)
            .set({ following_count: sql`${user.following_count} + 1` })
            .where(eq(user.id, followerId));

        await tx
            .update(user)
            .set({ followers_count: sql`${user.followers_count} + 1` })
            .where(eq(user.id, followingId));

        syncFollowToGraph(followerId.toString(), followingId.toString()).catch((err) =>
            console.error("[graph-sync] follow sync failed:", err)
        );

        return { followerId: followerId.toString(), followingId: followingId.toString() };
    });
}

export async function unfollowUser(followerId: bigint, followingId: bigint) {
    if (followerId === followingId) {
        throw new Error("Cannot unfollow yourself");
    }

    return await db.transaction(async (tx) => {
        const deleted = await tx
            .delete(follows)
            .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
            .returning();

        if (deleted.length === 0) {
            throw new Error("Not following this user");
        }

        await tx
            .update(user)
            .set({ following_count: sql`${user.following_count} - 1` })
            .where(eq(user.id, followerId));

        await tx
            .update(user)
            .set({ followers_count: sql`${user.followers_count} - 1` })
            .where(eq(user.id, followingId));

        removeFollowFromGraph(followerId.toString(), followingId.toString()).catch((err) =>
            console.error("[graph-sync] unfollow sync failed:", err)
        );

        return { followerId: followerId.toString(), followingId: followingId.toString() };
    });
}

export async function isFollowing(followerId: bigint, followingId: bigint): Promise<boolean> {
    const [row] = await db
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!row;
}

interface FollowUserInfo {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    verified: boolean;
    followers_count: number;
    following_count: number;
}

export async function getFollowers(
    userId: bigint,
    limit: number = 20,
    offset: number = 0
): Promise<FollowUserInfo[]> {
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
        .from(follows)
        .innerJoin(user, eq(follows.followerId, user.id))
        .where(eq(follows.followingId, userId))
        .orderBy(desc(follows.createdAt))
        .limit(limit)
        .offset(offset);

    return rows.map((r) => ({
        ...r,
        id: r.id.toString(),
        avatar_url: r.avatar_url ? config.cdn.baseUrl + "/" + r.avatar_url : null,
    }));
}

export async function getFollowing(
    userId: bigint,
    limit: number = 20,
    offset: number = 0
): Promise<FollowUserInfo[]> {
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
        .from(follows)
        .innerJoin(user, eq(follows.followingId, user.id))
        .where(eq(follows.followerId, userId))
        .orderBy(desc(follows.createdAt))
        .limit(limit)
        .offset(offset);

    return rows.map((r) => ({
        ...r,
        id: r.id.toString(),
        avatar_url: r.avatar_url ? config.cdn.baseUrl + "/" + r.avatar_url : null,
    }));
}

export async function getFollowingIds(userId: bigint): Promise<bigint[]> {
    const rows = await db
        .select({ followingId: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, userId));
    return rows.map((r) => r.followingId);
}
