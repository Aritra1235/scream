import * as v from 'valibot'

export const followSchema = v.object({
    username: v.pipe(v.string(), v.minLength(1)),
})

export const unfollowSchema = v.object({
    username: v.pipe(v.string(), v.minLength(1)),
})

export const checkFollowSchema = v.object({
    username: v.pipe(v.string(), v.minLength(1)),
})
