import { db } from "../../db/client";
import { user } from "../../db/schema";
import { eq } from "drizzle-orm";

async function checkIfUsernameExists(username: string) {
    const userExists = await db.select().from(user).where(eq(user.username, username));
    return userExists.length > 0;
}

export { checkIfUsernameExists };