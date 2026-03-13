import { db } from '../../db/client';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { config } from '../../config/index';
import { neo4jWrite } from '../../db/neo4j';

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

    // Create (or update) the User node in Neo4j so it is available for graph
    // queries (follows, suggestions, etc.) once onboarding completes.
    void neo4jWrite(
        `MERGE (u:User {id: $id})
         SET u.username = $username`,
        { id: userId.toString(), username }
    );

    return onboarded;
}

export { checkIfUserOnboardedAndEmailVerified, onboardUser };