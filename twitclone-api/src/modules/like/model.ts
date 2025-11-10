import * as v from 'valibot';

const likePostSchema = v.object({
    postId: v.string(),
});

const unlikePostSchema = v.object({
    postId: v.string(),
});

const getPostLikesCountSchema = v.object({
    postId: v.string(),
});

const getPostLikesSchema = v.object({
    postId: v.string(),
    limit: v.pipe(v.number(), v.minValue(1, 'Limit must be at least 1'), v.maxValue(100, 'Limit must be less than 100')),
    offset: v.number(),
});

export { likePostSchema, unlikePostSchema, getPostLikesCountSchema, getPostLikesSchema };