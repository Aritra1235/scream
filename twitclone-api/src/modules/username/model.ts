import * as v from 'valibot';

const usernameSchema = v.object({
    username: v.string(),
});

export { usernameSchema };