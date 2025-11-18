import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { user } from "../db/schema";
import { config } from "../config";

export const getUser = async (userId: bigint) => {
    const userData = await db.select().from(user).where(eq(user.id, userId));
    const userRecord = userData[0];

    // Build return object, only including non-null nullable fields
    const result: any = {
        id: userRecord.id.toString(),
        avatar_url: config.cdn.baseUrl+"/"+userRecord.avatar_url,
        banner_url: config.cdn.baseUrl+"/"+userRecord.banner_url,
        verified: userRecord.verified,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        onboarded: userRecord.onboarded,
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