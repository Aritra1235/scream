import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { user } from "../db/schema";
import { config } from "../config";

export const getUser = async (userId: bigint) => {
    const userData = await db.select().from(user).where(eq(user.id, userId));
    const userRecord = userData[0];
    // Convert BigInt to string for JSON serialization
    return {
        ...userRecord,
        id: userRecord.id.toString(),
        avatar_url: config.cdn.baseUrl+"/"+userRecord.avatar_url,
        banner_url: config.cdn.baseUrl+"/"+userRecord.banner_url,
    };
}