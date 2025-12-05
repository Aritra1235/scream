import * as v from 'valibot';

const createPostSchema = v.object({
    content: v.pipe(
        v.string(),
        v.minLength(1, 'Content must be at least 1 character'),
        v.maxLength(280, 'Content must be less than 280 characters'),
    ),
    mediaCount: v.number(),
});

const repostPostSchema = v.object({
    repostOf: v.string(),
});

const createReplySchema = v.object({
    parentId: v.string(),
    content: v.pipe(
        v.string(),
        v.minLength(1, 'Content must be at least 1 character'),
        v.maxLength(280, 'Content must be less than 280 characters'),
    ),
    mediaCount: v.optional(v.number(), 0),
});

const createQuoteRepostSchema = v.object({
    repostOf: v.string(),
    content: v.pipe(
        v.string(),
        v.maxLength(280, 'Content must be less than 280 characters'),
    ),
    mediaCount: v.optional(v.number(), 0),
});

const deletePostSchema = v.object({
    postId: v.string(),
});

const getPostByIdSchema = v.object({
    postId: v.string(),
});

const getPostsByUsernameSchema = v.object({
    username: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
});

export {
    createPostSchema,
    repostPostSchema,
    createReplySchema,
    createQuoteRepostSchema,
    deletePostSchema,
    getPostByIdSchema,
    getPostsByUsernameSchema,
};