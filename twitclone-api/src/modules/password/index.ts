import Elysia from "elysia";
import { apiPrefix } from "../../utils/const";
import { verifyResetTokenSchema } from "./model";
import { verifyResetToken } from "./services";

const password = new Elysia({ name: "password", prefix: apiPrefix })
  .get("/password/reset-token/:token/verify", async ({ params, status }) => {
    try {
      const result = await verifyResetToken(params.token);
      return result;
    } catch (error) {
      console.error("Verify reset token failed:", error);
      return status(500, { message: "Failed to verify reset token" });
    }
  }, {
    params: verifyResetTokenSchema,
  });

export { password };

