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


export { userIdSchema, usernameSchema };