import { z } from "zod";

export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, "Token is required").trim(),
});

export type VerifyResetTokenParams = z.infer<typeof verifyResetTokenSchema>;
