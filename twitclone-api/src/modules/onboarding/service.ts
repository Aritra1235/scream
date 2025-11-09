import { db } from '../../db/client';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';

async function checkIfUserOnboarded(userId: bigint) {
    const onboarded = await db.select().from(user).where(eq(user.id, userId));
    return onboarded[0]?.onboarded ?? false;
}

export { checkIfUserOnboarded };