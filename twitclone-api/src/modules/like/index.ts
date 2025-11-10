import Elysia from "elysia";
import { apiPrefix } from "../../utils/const";
import { likePostSchema, unlikePostSchema, getPostLikesCountSchema, getPostLikesSchema } from "./model";
import { likePost, unlikePost, getPostLikesCount, getPostLikes } from "./services";
import { auth } from "../../utils/auth";

const like = new Elysia({ name: "like", prefix: apiPrefix })
    .post('/like/like', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }

        try{
            const like = await likePost(BigInt(session.user.id), BigInt(body.postId));
            return { message: "Post liked"};
        } catch (error) {
            console.error('Like post failed:', error);
            return status(500, { message: "Failed to like post" });
        }
    }, {
        body: likePostSchema
    })
    .post('/like/unlike', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const unlike = await unlikePost(BigInt(session.user.id), BigInt(body.postId));
        if(!unlike) {
            return status(500, { message: "Failed to unlike post" });
        }
        return { message: "Post unliked"};
    }, {
        body: unlikePostSchema
    })
    .post('/like/likeCount', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const likeCount = await getPostLikesCount(BigInt(body.postId));
        return { count: likeCount };
    }, {
        body: getPostLikesCountSchema
    })
    .post('/like/likes', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const likes = await getPostLikes(BigInt(body.postId), Number(body.limit), Number(body.offset));
        return { message: "Post likes", likes: likes };
    }, {
        body: getPostLikesSchema
    })

export { like };