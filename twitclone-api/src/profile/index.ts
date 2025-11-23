import Elysia from "elysia";
import { apiPrefix } from "../utils/const";
import { getUser } from "./services";
import { auth } from "../utils/auth";

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

export { profile };