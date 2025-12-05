import Elysia from "elysia";
import { eq } from "drizzle-orm";
import { apiPrefix } from "../../utils/const";
import { getUser, getUserByUsername } from "./services";
import { auth } from "../../utils/auth";
import { userIdSchema, usernameSchema, updateProfileSchema } from "./model";
import { normalizeUsername } from "../../utils/normalize";
import { db } from "../../db/client";
import { user as userTable } from "../../db/schema";
import { getUserIdByUsername } from "../common";
import { config } from "../../config";

const profile = new Elysia({ name: "profile", prefix: apiPrefix })
    .get('/profile/me', async ({ request: { headers }, status }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        if (!session.user.emailVerified) {
            return status(403, { message: "Email not verified" });
        }
        const userId = session?.user.id;
        const user = await getUser(BigInt(userId));
        return { user };
    })

    .get('/profile/by-id/:userId', async ({ params, status }) => {
        const user = await getUser(BigInt(params.userId));
        return { user };
    }, {
        params: userIdSchema
    })

    .get('/profile/:username', async ({ params, status }) => {
        try {
            const user = await getUserByUsername(params.username);
            if (!user) {
                return status(404, { message: "User not found" });
            }
            return { user };
        } catch (error) {
            console.error('Failed to get user:', error);
            return status(500, { message: "Failed to get user" });
        }
    }, {
        params: usernameSchema
    })
    .put('/profile/me', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        if (!session.user.emailVerified) {
            return status(403, { message: "Email not verified" });
        }

        const userId = BigInt(session.user.id);
        const updates: Record<string, string> = {};

        if (typeof body.display_name === "string") {
            updates.display_name = body.display_name.trim();
        }

        if (typeof body.username === "string") {
            const normalized = normalizeUsername(body.username);
            const existingUserId = await getUserIdByUsername(normalized);
            if (existingUserId && BigInt(existingUserId) !== userId) {
                return status(409, { message: "Username already taken" });
            }
            updates.username = normalized;
        }

        if (typeof body.avatar_url === "string") {
            updates.avatar_url = stripCdnPrefix(body.avatar_url);
        }

        if (typeof body.banner_url === "string") {
            updates.banner_url = stripCdnPrefix(body.banner_url);
        }

        if (Object.keys(updates).length === 0) {
            const user = await getUser(userId);
            return { user };
        }

        await db.update(userTable)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(eq(userTable.id, userId));

        const user = await getUser(userId);
        return { user };
    }, {
        body: updateProfileSchema
    })

export { profile };

function stripCdnPrefix(url: string) {
    const trimmed = url.trim();
    const base = config.cdn.baseUrl?.replace(/\/+$/, "");
    if (base && trimmed.startsWith(base)) {
        const withoutBase = trimmed.slice(base.length);
        return withoutBase.startsWith("/") ? withoutBase.slice(1) : withoutBase;
    }
    return trimmed.replace(/^\/+/, "");
}