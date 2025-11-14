import { Elysia } from "elysia";
import { userIdSchema, onboardingSchema } from './model';
import { checkIfUserOnboarded, onboardUser } from './service';
import { auth } from '../../utils/auth';
import { apiPrefix } from '../../utils/const';
import { normalizeUsername } from '../../utils/normalize';

const onboarding = new Elysia({ name: "onboarding", prefix: apiPrefix })
    .get('/onboarding/:userId', async ({ params, request: { headers }, status, }) => {
        const session = await auth.api.getSession({
            headers
        });
        console.log("session", session);
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const userId = session?.user.id;
        if (BigInt(userId) !== BigInt(params.userId)) {
            return status(403, { message: "Forbidden: Not your own user" });
        }
        const onboarded = await checkIfUserOnboarded(BigInt(params.userId));
        
        if (onboarded) {
            return { message: "User already onboarded", onboarded: onboarded }
        } else {
            return { message: "User not onboarded", onboarded: onboarded }
        }
    }, {
        params: userIdSchema
    })
    .post('/onboarding', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const userId = session?.user.id;
        const onboarded = await onboardUser(BigInt(userId), normalizeUsername(body.username), body.display_name, body.bio ?? null, body.avatar_url ?? null, body.banner_url ?? null);
        if (!onboarded) {
            return status(500, { message: "Failed to onboard user" });
        }
        return { message: "User onboarded"};
    }, {
        body: onboardingSchema
    })


export { onboarding };