import { db } from '../../db/client';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { config } from "../../config";

async function checkIfUserOnboardedAndEmailVerified(userId: bigint) {
    const userData = await db.select().from(user).where(eq(user.id, userId));
    const userRecord = userData[0];
    return userRecord.onboarded && userRecord.emailVerified;
}

async function onboardUser(userId: bigint, username: string, display_name: string, bio: string | null, avatar_url: string | null, banner_url: string | null) {
    const onboarded = await db.update(user).set({
        username,
        display_name,
        bio: bio ?? null,
        avatar_url: avatar_url ?? config.cdn.defaultAvatar,
        banner_url: banner_url ?? config.cdn.defaultBanner,
        onboarded: true,
    }).where(eq(user.id, userId));
    return onboarded;
}

export { checkIfUserOnboardedAndEmailVerified, onboardUser };