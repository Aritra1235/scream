import { db } from "../../db/client";
import { user } from "../../db/schema";
import { eq } from "drizzle-orm";

async function getUserIdByUsername(username: string) {
    const userId = await db.select({ id: user.id }).from(user).where(eq(user.username, username));
    console.log('userId', userId);
    if (!userId[0]) {
        return null;
    }
    return userId[0].id;
}

export { getUserIdByUsername };