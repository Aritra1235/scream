import Elysia from "elysia";
import { apiPrefix } from "../../utils/const";
import { auth } from "../../utils/auth";
import { followUser, unfollowUser, isFollowing, getFollowers, getFollowing } from "./services";
import { followSchema, usernameParamSchema, userIdParamSchema } from "./model";
import { getUserIdByUsername } from "../common";

const follow = new Elysia({ name: "follow", prefix: apiPrefix })
    .post("/follow", async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        try {
            const result = await followUser(BigInt(session.user.id), BigInt(body.targetUserId));
            return { message: "Followed successfully", ...result };
        } catch (error: any) {
            if (error.message === "Cannot follow yourself") {
                return status(400, { message: error.message });
            }
            if (error.message === "Already following this user") {
                return status(409, { message: error.message });
            }
            console.error("Follow error:", error);
            return status(500, { message: "Failed to follow user" });
        }
    }, { body: followSchema })

    .post("/unfollow", async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        try {
            const result = await unfollowUser(BigInt(session.user.id), BigInt(body.targetUserId));
            return { message: "Unfollowed successfully", ...result };
        } catch (error: any) {
            if (error.message === "Not following this user") {
                return status(404, { message: error.message });
            }
            console.error("Unfollow error:", error);
            return status(500, { message: "Failed to unfollow user" });
        }
    }, { body: followSchema })

    .get("/follow/status/:userId", async ({ request: { headers }, status, params }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const following = await isFollowing(BigInt(session.user.id), BigInt(params.userId));
        return { isFollowing: following };
    }, { params: userIdParamSchema })

    .get("/followers/:username", async ({ params, query, status }) => {
        try {
            const userId = await getUserIdByUsername(params.username);
            if (!userId) {
                return status(404, { message: "User not found" });
            }
            const limit = Number(query.limit) || 20;
            const offset = Number(query.offset) || 0;
            const followers = await getFollowers(BigInt(userId), limit, offset);
            return { followers };
        } catch (error) {
            console.error("Get followers error:", error);
            return status(500, { message: "Failed to get followers" });
        }
    }, { params: usernameParamSchema })

    .get("/following/:username", async ({ params, query, status }) => {
        try {
            const userId = await getUserIdByUsername(params.username);
            if (!userId) {
                return status(404, { message: "User not found" });
            }
            const limit = Number(query.limit) || 20;
            const offset = Number(query.offset) || 0;
            const following = await getFollowing(BigInt(userId), limit, offset);
            return { following };
        } catch (error) {
            console.error("Get following error:", error);
            return status(500, { message: "Failed to get following" });
        }
    }, { params: usernameParamSchema });

export { follow };
