import { db } from '../../db/client';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { config } from '../../config/index';

async function checkIfUserOnboarded(userId: bigint) {
    const onboarded = await db.select().from(user).where(eq(user.id, userId));
    return onboarded[0]?.onboarded ?? false;
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

export { checkIfUserOnboarded, onboardUser };