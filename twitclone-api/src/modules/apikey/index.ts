import Elysia from 'elysia';
import { apiPrefix } from '../../utils/const';
import {
    createApiKeySchema,
    verifyApiKeySchema,
    getApiKeySchema,
    updateApiKeySchema,
    deleteApiKeySchema,
    listApiKeysSchema,
} from './model';
import {
    createApiKey,
    verifyApiKey,
    getApiKey,
    updateApiKey,
    deleteApiKey,
    listApiKeys,
    deleteExpiredApiKeys,
    updateApiKeyUsage,
} from './services';
import { auth } from '../../utils/auth';

const apiKeyModule = new Elysia({ name: 'apikey', prefix: apiPrefix })
    .post('/apikey/create', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: 'Unauthorized' });
        }

        try {
            const createdKey = await auth.api.createApiKey({
                body: {
                    name: body.name,
                    expiresIn: body.expiresIn,
                    userId: BigInt(session.user.id),
                    prefix: body.prefix,
                    remaining: body.remaining,
                    metadata: body.metadata,
                    refillAmount: body.refillAmount,
                    refillInterval: body.refillInterval,
                    rateLimitTimeWindow: body.rateLimitTimeWindow,
                    rateLimitMax: body.rateLimitMax,
                    rateLimitEnabled: body.rateLimitEnabled,
                },
            });

            return {
                success: true,
                message: 'API key created successfully',
                data: createdKey,
            };
        } catch (error) {
            console.error('Create API key failed:', error);
            return status(500, { message: 'Failed to create API key' });
        }
    }, {
        body: createApiKeySchema,
    })

    .post('/apikey/verify', async ({ request: { headers }, status, body }) => {
        try {
            await deleteExpiredApiKeys();

            const result = await auth.api.verifyApiKey({
                body: {
                    key: body.key,
                },
            });

            if (result.valid && result.key) {
                await updateApiKeyUsage(BigInt(result.key.id), true);
            }

            return result;
        } catch (error) {
            console.error('Verify API key failed:', error);
            return status(500, {
                valid: false,
                error: { message: 'Verification error', code: 'VERIFICATION_ERROR' },
                key: null,
            });
        }
    }, {
        body: verifyApiKeySchema,
    })

    .get('/apikey/:keyId', async ({ request: { headers }, status, params }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: 'Unauthorized' });
        }

        try {
            const keyData = await getApiKey(BigInt(params.keyId), BigInt(session.user.id));

            if (!keyData) {
                return status(404, { message: 'API key not found' });
            }

            return {
                success: true,
                message: 'API key retrieved successfully',
                data: keyData,
            };
        } catch (error) {
            console.error('Get API key failed:', error);
            return status(500, { message: 'Failed to retrieve API key' });
        }
    }, {
        body: getApiKeySchema,
    })

    .patch('/apikey/:keyId', async ({ request: { headers }, status, params, body }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: 'Unauthorized' });
        }

        try {
            const updated = await updateApiKey(
                BigInt(params.keyId),
                BigInt(session.user.id),
                {
                    name: body.name,
                    enabled: body.enabled,
                    remaining: body.remaining,
                    refillAmount: body.refillAmount,
                    refillInterval: body.refillInterval,
                    rateLimitMax: body.rateLimitMax,
                    rateLimitTimeWindow: body.rateLimitTimeWindow,
                    rateLimitEnabled: body.rateLimitEnabled,
                    permissions: body.permissions ? JSON.stringify(body.permissions) : undefined,
                    metadata: body.metadata ? JSON.stringify(body.metadata) : undefined,
                }
            );

            if (!updated) {
                return status(404, { message: 'API key not found' });
            }

            return {
                success: true,
                message: 'API key updated successfully',
                data: updated,
            };
        } catch (error) {
            console.error('Update API key failed:', error);
            return status(500, { message: 'Failed to update API key' });
        }
    }, {
        body: updateApiKeySchema,
    })

    .delete('/apikey/:keyId', async ({ request: { headers }, status, params }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: 'Unauthorized' });
        }

        try {
            const deleted = await deleteApiKey(BigInt(params.keyId), BigInt(session.user.id));

            if (!deleted) {
                return status(404, { message: 'API key not found' });
            }

            return {
                success: true,
                message: 'API key deleted successfully',
            };
        } catch (error) {
            console.error('Delete API key failed:', error);
            return status(500, { message: 'Failed to delete API key' });
        }
    })

    .get('/apikey/list', async ({ request: { headers }, status, query }) => {
        const session = await auth.api.getSession({ headers });
        if (!session) {
            return status(401, { message: 'Unauthorized' });
        }

        try {
            const limit = Math.min(Number(query.limit) || 50, 100);
            const offset = Number(query.offset) || 0;

            const keys = await listApiKeys(BigInt(session.user.id), limit, offset);

            return {
                success: true,
                message: 'API keys retrieved successfully',
                data: keys,
            };
        } catch (error) {
            console.error('List API keys failed:', error);
            return status(500, { message: 'Failed to list API keys' });
        }
    }, {
        query: listApiKeysSchema,
    })

    .post('/apikey/delete-expired', async ({ status }) => {
        try {
            const deletedCount = await deleteExpiredApiKeys();

            return {
                success: true,
                message: 'Expired API keys deleted successfully',
                deletedCount,
            };
        } catch (error) {
            console.error('Delete expired API keys failed:', error);
            return status(500, { message: 'Failed to delete expired API keys' });
        }
    });

export { apiKeyModule };

