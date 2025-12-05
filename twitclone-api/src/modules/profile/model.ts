import * as v from 'valibot'; 

const userIdSchema = v.object({
    userId: v.pipe(
        v.string(),
        v.minLength(1, 'Id must be positive'),
    ),
})

const usernameSchema = v.object({
    username: v.string(),
});

const updateProfileSchema = v.object({
    username: v.optional(v.pipe(
        v.string(),
        v.minLength(3, 'Username must be at least 3 characters'),
    )),
    display_name: v.optional(v.pipe(
        v.string(),
        v.minLength(1, 'Display name is required'),
    )),
    avatar_url: v.optional(v.string()),
    banner_url: v.optional(v.string()),
});


export { userIdSchema, usernameSchema, updateProfileSchema };