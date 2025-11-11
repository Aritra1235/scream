import Elysia from "elysia";
import { apiPrefix } from "../../utils/const";
import { checkIfUsernameExists } from "./services";
import { usernameSchema } from "./model";
import { auth } from "../../utils/auth";

const username = new Elysia({ name: "username", prefix: apiPrefix })
    .get('/username/:username', async ({ params, status, request: { headers } }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const usernameExists = await checkIfUsernameExists(params.username);
        return { usernameExists };
    }, {
        params: usernameSchema
    })

export { username };