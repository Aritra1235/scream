import Elysia from "elysia";
import { apiPrefix } from "../../utils/const";
import { auth } from "../../utils/auth";
import { getWhoToFollow, getMutualFollowers, getTrendingUsers, getDegreesOfSeparation } from "./services";
import { getUserIdByUsername } from "../common";

const graph = new Elysia({ name: "graph", prefix: apiPrefix })
    .get("/graph/suggestions", async ({ request: { headers }, status, query }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        try {
            const limit = Number(query.limit) || 5;
            const suggestions = await getWhoToFollow(session.user.id, limit);
            return { suggestions };
        } catch (error) {
            console.error("Suggestions error:", error);
            return status(500, { message: "Failed to get suggestions" });
        }
    })

    .get("/graph/mutual/:username", async ({ request: { headers }, status, params, query }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        try {
            const targetUserId = await getUserIdByUsername(params.username);
            if (!targetUserId) {
                return status(404, { message: "User not found" });
            }
            const limit = Number(query.limit) || 10;
            const mutuals = await getMutualFollowers(session.user.id, targetUserId, limit);
            return { mutuals };
        } catch (error) {
            console.error("Mutual followers error:", error);
            return status(500, { message: "Failed to get mutual followers" });
        }
    })

    .get("/graph/trending", async ({ request: { headers }, status, query }) => {
        let currentUserId: string | null = null;
        try {
            const session = await auth.api.getSession({ headers });
            currentUserId = session?.user?.id || null;
        } catch {}
        try {
            const limit = Number(query.limit) || 10;
            const trending = await getTrendingUsers(currentUserId, limit);
            return { trending };
        } catch (error) {
            console.error("Trending error:", error);
            return status(500, { message: "Failed to get trending users" });
        }
    })

    .get("/graph/degrees/:userId1/:userId2", async ({ params, status }) => {
        try {
            const degrees = await getDegreesOfSeparation(params.userId1, params.userId2);
            return { degrees };
        } catch (error) {
            console.error("Degrees of separation error:", error);
            return status(500, { message: "Failed to calculate degrees of separation" });
        }
    });

export { graph };
