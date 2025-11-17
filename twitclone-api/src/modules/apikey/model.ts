import * as v from 'valibot';

const createApiKeySchema = v.object({
    name: v.optional(v.string()),
    prefix: v.optional(v.string()),
    remaining: v.optional(v.number()),
    expiresIn: v.optional(v.number()),
    rateLimitEnabled: v.optional(v.boolean()),
    rateLimitMax: v.optional(v.number()),
    rateLimitTimeWindow: v.optional(v.number()),
    refillInterval: v.optional(v.number()),
    refillAmount: v.optional(v.number()),
    permissions: v.optional(v.string()),
    metadata: v.optional(v.any()),
});

const verifyApiKeySchema = v.object({
    key: v.string(),
    permissions: v.optional(v.any()),
});

const getApiKeySchema = v.object({
    keyId: v.string(),
});

const updateApiKeySchema = v.object({
    keyId: v.string(),
    name: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    remaining: v.optional(v.number()),
    refillAmount: v.optional(v.number()),
    refillInterval: v.optional(v.number()),
    rateLimitMax: v.optional(v.number()),
    rateLimitTimeWindow: v.optional(v.number()),
    rateLimitEnabled: v.optional(v.boolean()),
    permissions: v.optional(v.string()),
    metadata: v.optional(v.any()),
});

const deleteApiKeySchema = v.object({
    keyId: v.string(),
});

const listApiKeysSchema = v.object({
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
});

export {
    createApiKeySchema,
    verifyApiKeySchema,
    getApiKeySchema,
    updateApiKeySchema,
    deleteApiKeySchema,
    listApiKeysSchema,
};

