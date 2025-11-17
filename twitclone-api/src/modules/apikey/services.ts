import { db } from '../../db/client';
import { apiKey, ApiKey, NewApiKey } from '../../db/schema';
import { eq, and, lt, desc } from 'drizzle-orm';
import { generateId } from '../../utils/snowflake';
import * as crypto from 'crypto';

const DEFAULT_KEY_LENGTH = 64;
const DEFAULT_PREFIX = 'sk_';
const STARTING_CHARS_LENGTH = 6;

interface CreateApiKeyOptions {
    name?: string;
    prefix?: string;
    userId: bigint;
    remaining?: number;
    expiresIn?: number;
    rateLimitEnabled?: boolean;
    rateLimitMax?: number;
    rateLimitTimeWindow?: number;
    refillInterval?: number;
    refillAmount?: number;
    permissions?: string;
    metadata?: any;
}

interface VerifyApiKeyOptions {
    key: string;
    permissions?: Record<string, string[]>;
}

interface VerifyResult {
    valid: boolean;
    error: { message: string; code: string } | null;
    key: Omit<ApiKey, 'key'> | null;
}

function generateRandomKey(length: number = DEFAULT_KEY_LENGTH, prefix: string = ''): string {
    const randomPart = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    return prefix + randomPart;
}

function hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
}

function getStartingCharacters(key: string, length: number = STARTING_CHARS_LENGTH): string {
    return key.slice(0, length);
}

async function createApiKey(options: CreateApiKeyOptions): Promise<Omit<ApiKey, 'key'> & { key: string }> {
    const prefix = options.prefix || DEFAULT_PREFIX;
    const plainKey = generateRandomKey(DEFAULT_KEY_LENGTH, prefix);
    const hashedKey = hashKey(plainKey);
    const startChars = getStartingCharacters(plainKey);
    
    const now = new Date();
    const expiresAt = options.expiresIn
        ? new Date(now.getTime() + options.expiresIn * 1000)
        : null;

    const newApiKey: NewApiKey = {
        id: generateId(),
        name: options.name || `API Key ${new Date().toISOString()}`,
        start: startChars,
        prefix: prefix,
        key: hashedKey,
        userId: options.userId,
        refillInterval: options.refillInterval ?? undefined,
        refillAmount: options.refillAmount ?? undefined,
        lastRefillAt: null,
        enabled: true,
        rateLimitEnabled: options.rateLimitEnabled ?? false,
        rateLimitTimeWindow: options.rateLimitTimeWindow ?? null,
        rateLimitMax: options.rateLimitMax ?? null,
        requestCount: 0,
        remaining: options.remaining ?? null,
        lastRequest: null,
        expiresAt: expiresAt,
        createdAt: now,
        updatedAt: now,
        permissions: options.permissions ?? null,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
    };

    const [created] = await db.insert(apiKey).values(newApiKey).returning();
    
    if (!created) {
        throw new Error('Failed to create API key');
    }

    const { key: _, ...keyWithoutHash } = created;
    return {
        ...keyWithoutHash,
        id: keyWithoutHash.id.toString(),
        userId: keyWithoutHash.userId.toString(),
        key: plainKey,
    } as any;
}

async function verifyApiKey(options: VerifyApiKeyOptions): Promise<VerifyResult> {
    try {
        const hashedKey = hashKey(options.key);
        
        const [foundKey] = await db
            .select()
            .from(apiKey)
            .where(eq(apiKey.key, hashedKey))
            .limit(1);

        if (!foundKey) {
            return {
                valid: false,
                error: { message: 'Invalid API key', code: 'INVALID_KEY' },
                key: null,
            };
        }

        if (!foundKey.enabled) {
            return {
                valid: false,
                error: { message: 'API key is disabled', code: 'KEY_DISABLED' },
                key: null,
            };
        }

        if (foundKey.expiresAt && foundKey.expiresAt < new Date()) {
            return {
                valid: false,
                error: { message: 'API key has expired', code: 'KEY_EXPIRED' },
                key: null,
            };
        }

        if (foundKey.remaining !== null && foundKey.remaining <= 0) {
            return {
                valid: false,
                error: { message: 'API key has no remaining requests', code: 'NO_REMAINING' },
                key: null,
            };
        }

        if (options.permissions && foundKey.permissions) {
            const keyPermissions = JSON.parse(foundKey.permissions);
            
            for (const [resource, requiredActions] of Object.entries(options.permissions)) {
                if (!keyPermissions[resource]) {
                    return {
                        valid: false,
                        error: { message: `Missing permission for resource: ${resource}`, code: 'MISSING_PERMISSION' },
                        key: null,
                    };
                }
                
                const keyActions = Array.isArray(keyPermissions[resource]) ? keyPermissions[resource] : [];
                const hasAllActions = (requiredActions as string[]).every((action: string) =>
                    keyActions.includes(action)
                );
                
                if (!hasAllActions) {
                    return {
                        valid: false,
                        error: { message: `Insufficient permissions for resource: ${resource}`, code: 'INSUFFICIENT_PERMISSION' },
                        key: null,
                    };
                }
            }
        }

        const { key: _, ...keyData } = foundKey;
        return {
            valid: true,
            error: null,
            key: {
                ...keyData,
                id: keyData.id.toString(),
                userId: keyData.userId.toString(),
            } as any,
        };
    } catch (error) {
        return {
            valid: false,
            error: { message: 'Failed to verify API key', code: 'VERIFICATION_ERROR' },
            key: null,
        };
    }
}

async function getApiKey(keyId: bigint, userId: bigint): Promise<Omit<ApiKey, 'key'> | null> {
    const [foundKey] = await db
        .select()
        .from(apiKey)
        .where(and(
            eq(apiKey.id, keyId),
            eq(apiKey.userId, userId)
        ))
        .limit(1);

    if (!foundKey) {
        return null;
    }

    const { key: _, ...keyData } = foundKey;
    return {
        ...keyData,
        id: keyData.id.toString(),
        userId: keyData.userId.toString(),
    } as any;
}

async function updateApiKey(
    keyId: bigint,
    userId: bigint,
    updates: Partial<Omit<NewApiKey, 'id' | 'userId'>>
): Promise<Omit<ApiKey, 'key'> | null> {
    const updateData = {
        ...updates,
        updatedAt: new Date(),
    };

    const [updated] = await db
        .update(apiKey)
        .set(updateData)
        .where(and(
            eq(apiKey.id, keyId),
            eq(apiKey.userId, userId)
        ))
        .returning();

    if (!updated) {
        return null;
    }

    const { key: _, ...keyData } = updated;
    return {
        ...keyData,
        id: keyData.id.toString(),
        userId: keyData.userId.toString(),
    } as any;
}

async function deleteApiKey(keyId: bigint, userId: bigint): Promise<boolean> {
    const result = await db
        .delete(apiKey)
        .where(and(
            eq(apiKey.id, keyId),
            eq(apiKey.userId, userId)
        ))
        .returning();

    return result.length > 0;
}

async function listApiKeys(userId: bigint, limit: number = 50, offset: number = 0): Promise<any[]> {
    const keys = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.userId, userId))
        .orderBy(desc(apiKey.createdAt))
        .limit(limit)
        .offset(offset);

    return keys.map(({ key: _, ...rest }) => ({
        ...rest,
        id: rest.id.toString(),
        userId: rest.userId.toString(),
    }));
}

async function deleteExpiredApiKeys(): Promise<number> {
    const result = await db
        .delete(apiKey)
        .where(lt(apiKey.expiresAt, new Date()))
        .returning();

    return result.length;
}

async function updateApiKeyUsage(
    keyId: bigint,
    decrementRemaining: boolean = true
): Promise<void> {
    const now = new Date();
    const updates: any = {
        lastRequest: now,
        updatedAt: now,
    };

    if (decrementRemaining) {
        const [currentKey] = await db
            .select()
            .from(apiKey)
            .where(eq(apiKey.id, keyId))
            .limit(1);

        if (currentKey && currentKey.remaining !== null) {
            updates.remaining = Math.max(0, currentKey.remaining - 1);
        }

        if (currentKey && currentKey.requestCount !== null) {
            updates.requestCount = (currentKey.requestCount || 0) + 1;
        }
    }

    await db
        .update(apiKey)
        .set(updates)
        .where(eq(apiKey.id, keyId));
}

export {
    createApiKey,
    verifyApiKey,
    getApiKey,
    updateApiKey,
    deleteApiKey,
    listApiKeys,
    deleteExpiredApiKeys,
    updateApiKeyUsage,
    generateRandomKey,
    hashKey,
    getStartingCharacters,
};

