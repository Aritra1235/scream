import { Elysia } from "elysia";
import { userIdSchema } from './model';
import { checkIfUserOnboarded } from './service';
import { auth } from '../../utils/auth';

const onboarding = new Elysia({ name: "onboarding" })
    .get('/onboarding/:userId', async ({ params, request: { headers }, status }) => {
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
    


export { onboarding };