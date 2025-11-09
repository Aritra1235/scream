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

const deletePostSchema = v.object({
    postId: v.string(),
});

export { createPostSchema, repostPostSchema, deletePostSchema };