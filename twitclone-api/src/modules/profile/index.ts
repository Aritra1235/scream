import Elysia from "elysia";
import { apiPrefix } from "../../utils/const";
import { getUser, getUserByUsername } from "./services";
import { auth } from "../../utils/auth";
import { userIdSchema } from "./model";
import { usernameSchema } from "./model";

const profile = new Elysia({ name: "profile", prefix: apiPrefix })
    .get('/profile/me', async ({ request: { headers }, status }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        if (!session.user.emailVerified) {
            return status(403, { message: "Email not verified" });
        }
        const userId = session?.user.id;
        const user = await getUser(BigInt(userId));
        return { user };
    })

    .get('/profile/by-id/:userId', async ({ params, status }) => {
        const user = await getUser(BigInt(params.userId));
        return { user };
    }, {
        params: userIdSchema
    })

    .get('/profile/:username', async ({ params, status }) => {
        const user = await getUserByUsername(params.username);
        return { user };
    }, {
        params: usernameSchema
    })

export { profile };