import * as v from 'valibot'; 

const userIdSchema = v.object({
    userId: v.pipe(
        v.string(),
        v.minLength(1, 'Id must be positive'),
    ),
})

export { userIdSchema };