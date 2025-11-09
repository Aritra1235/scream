import * as v from 'valibot'; 

const userIdSchema = v.object({
    userId: v.pipe(
        v.string(),
        v.minLength(1, 'Id must be positive'),
    ),
})

const onboardingSchema = v.object({
    username: v.string(),
    display_name: v.string(),
    bio: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    banner_url: v.optional(v.string()),
});


export { userIdSchema, onboardingSchema };