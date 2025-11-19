import Elysia from "elysia";
import { apiPrefix } from "../../utils/const";
import { getSimpleFeed } from "./services";
import { auth } from "../../utils/auth";

const feed = new Elysia({ name: "feed", prefix: apiPrefix })
    .get('/feed', async ({ request: { headers }, status, query }) => {
        try {
            const session = await auth.api.getSession({
                headers
            });
            if (!session) {
                return status(401, { message: "Unauthorized" });
            }

            const limit = parseInt(query.limit) || 20;
            const offset = parseInt(query.offset) || 0;

            const simpleFeedPosts = await getSimpleFeed(limit, offset, session.user.id);
            return { posts: simpleFeedPosts };
        } catch (error) {
            console.error('Feed error:', error);
            return status(500, { message: "Failed to load feed" });
        }
    })


export { feed };