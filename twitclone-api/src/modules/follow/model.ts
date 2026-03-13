import * as v from "valibot";

export const followSchema = v.object({
    targetUserId: v.string(),
});

export const usernameParamSchema = v.object({
    username: v.string(),
});

export const userIdParamSchema = v.object({
    userId: v.string(),
});
