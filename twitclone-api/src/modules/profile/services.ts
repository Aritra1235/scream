import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { user } from "../../db/schema";
import { config } from "../../config";
import { getUserIdByUsername } from "../common";

export async function getUser(userId: bigint) {
    const userData = await db.select().from(user).where(eq(user.id, userId));
    const userRecord = userData[0];
    console.log(userRecord);

    // Build return object, only including non-null nullable fields
    const result: any = {
        id: userRecord.id.toString(),
        avatar_url: config.aws.bucketName + "/" + userRecord.avatar_url,
        banner_url: config.aws.bucketName + "/" + userRecord.banner_url,
        verified: userRecord.verified,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        onboarded: userRecord.onboarded,
        followers_count: userRecord.followers_count,
        following_count: userRecord.following_count,
        posts_count: userRecord.posts_count,
        createdAt: userRecord.createdAt,
        updatedAt: userRecord.updatedAt,
    };

    // Add nullable fields only if they're not null
    if (userRecord.username !== null) result.username = userRecord.username;
    if (userRecord.display_name !== null) result.display_name = userRecord.display_name;
    if (userRecord.displayUsername !== null) result.displayUsername = userRecord.displayUsername;
    if (userRecord.bio !== null) result.bio = userRecord.bio;
    if (userRecord.name !== null) result.name = userRecord.name;
    if (userRecord.image !== null) result.image = userRecord.image;

    return result;
}


export async function getUserByUsername(username: string) {
    const userId = await getUserIdByUsername(username);
    if (!userId) {
        return null;
    }
    const user = await getUser(BigInt(userId));
    if (!user) {
        return null;
    }
    return user;
}



