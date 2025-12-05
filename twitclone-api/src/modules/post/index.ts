import Elysia from "elysia";
import { apiPrefix } from "../../utils/const";
import {
    createPostSchema,
    createReplySchema,
    createQuoteRepostSchema,
    repostPostSchema,
    deletePostSchema,
    getPostByIdSchema,
    getPostsByUsernameSchema
} from "./modals";
import { auth } from "../../utils/auth";
import {
    createPost,
    createReply,
    createQuoteRepost,
    repostPost,
    deletePost,
    isPostOwner,
    getPostsByUsername
} from "./services";
import { getPostWithThread } from "../feed/services";

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

    .post('/post/reply', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({ headers });

        if (!session) {
            const apiKey = await auth.api.verifyApiKey({
                body: {
                    key: headers.get('Authorization') || '',
                }
            });
            if (!apiKey) {
                return status(401, { message: "Unauthorized" });
            }
            const userId = apiKey.key?.userId;
            if (!userId) {
                return status(401, { message: "Invalid API key" });
            }
            const post = await createReply(BigInt(userId), BigInt(body.parentId), body.content, body.mediaCount || 0);
            return {
                message: "Reply created",
                post: {
                    ...post[0],
                    id: post[0].id.toString(),
                    userId: post[0].userId.toString(),
                    parentId: post[0].parentId?.toString() || null
                }
            };
        }

        const userId = session.user.id;
        const post = await createReply(BigInt(userId), BigInt(body.parentId), body.content, body.mediaCount || 0);
        return {
            message: "Reply created",
            post: {
                ...post[0],
                id: post[0].id.toString(),
                userId: post[0].userId.toString(),
                parentId: post[0].parentId?.toString() || null
            }
        };
    }, {
        body: createReplySchema
    })

    .post('/post/repost', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const userId = session.user.id;
        const post = await repostPost(BigInt(userId), BigInt(body.repostOf));
        return {
            message: "Post reposted",
            post: {
                ...post[0],
                id: post[0].id.toString(),
                userId: post[0].userId.toString(),
                repostOf: post[0].repostOf?.toString() || null
            }
        };
    }, {
        body: repostPostSchema
    })

    .post('/post/quote', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const userId = session.user.id;
        const post = await createQuoteRepost(BigInt(userId), BigInt(body.repostOf), body.content || '', body.mediaCount || 0);
        return {
            message: "Post quoted",
            post: {
                ...post[0],
                id: post[0].id.toString(),
                userId: post[0].userId.toString(),
                repostOf: post[0].repostOf?.toString() || null
            }
        };
    }, {
        body: createQuoteRepostSchema
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

    .get('/post/id/:postId', async ({ params, request: { headers }, status }) => {
        try {
            const session = await auth.api.getSession({ headers });
            const currentUserId = session?.user?.id;
            const post = await getPostWithThread(params.postId, currentUserId);
            if (!post) {
                return status(404, { message: "Post not found" });
            }
            return { post };
        } catch (error) {
            console.error('Failed to get post', error);
            return status(500, { message: "Failed to get post" });
        }
    }, {
        params: getPostByIdSchema
    })


export { posts };