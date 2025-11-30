import Elysia from "elysia";
import { apiPrefix } from "../../utils/const";
import { createPostSchema, deletePostSchema, getPostsByUsernameSchema } from "./modals";
import { auth } from "../../utils/auth";
import { createPost, deletePost, isPostOwner, getPostsByUsername } from "./services";

const posts = new Elysia({ name: "posts", prefix: apiPrefix })
    .post('/post/create', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({ headers });


        if (!session) {
            console.log(headers.get('Authorization'));
            const apiKey = await auth.api.verifyApiKey({
                body: {
                    key: headers.get('Authorization') || '',
                }
            });
            console.log('apiKey', apiKey);
            if (!apiKey) {
                return status(401, { message: "Unauthorized" });
            }
            const userId = apiKey.key?.userId;
            if (!userId) {
                return status(401, { message: "Invalid API key" });
            }
            const post = await createPost(BigInt(userId), body.content, body.mediaCount);
            return {
                message: "Post created",
                post: {
                    ...post[0],
                    id: post[0].id.toString(),
                    userId: post[0].userId.toString()
                }
            };
        }
        try {
            const userId = session.user.id;
            const post = await createPost(BigInt(userId), body.content, body.mediaCount);

            return {
                message: "Post created",
                post: {
                    ...post[0],
                    id: post[0].id.toString(),
                    userId: post[0].userId.toString()
                }
            };
        } catch (error) {
            // Log detailed error server-side
            console.error('Post creation failed:', error);
            // Return generic message to client
            return status(500, { message: "Failed to create post" });
        }
    }, {
        body: createPostSchema
    })

    .post('/post/delete', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const userId = session?.user.id;
        if (!await isPostOwner(BigInt(body.postId), BigInt(userId))) {
            return status(403, { message: "Forbidden: Not your own post" });
        }
        const post = await deletePost(BigInt(body.postId));
        if (!post) {
            return status(500, { message: "Failed to delete post" });
        }
        return { message: "Post deleted", post: { ...post[0], id: post[0].id.toString(), userId: post[0].userId.toString() } };
    }, {
        body: deletePostSchema
    })

    .get('/post/:username', async ({ params, query, status }) => {
        try {
            if (!params.username) {
                return status(400, { message: "Username is required" });
            }
            const posts = await getPostsByUsername(params.username, Number(query.limit) || 20, Number(query.offset) || 0);
            return { posts };
        } catch (error) {
            console.error('Failed to get posts:', error);
            return status(500, { message: "Failed to get posts" });
        }
    }, {
        params: getPostsByUsernameSchema
    })


export { posts };