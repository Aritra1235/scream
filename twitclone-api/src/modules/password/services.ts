import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { verification } from "../../db/schema";

export async function verifyResetToken(token: string) {
  if (!token?.trim()) {
    return {
      valid: false,
      reason: "MISSING_TOKEN",
    };
  }

  const identifier = `reset-password:${token.trim()}`;
  const record = await db.query.verification.findFirst({
    where: eq(verification.identifier, identifier),
  });

  if (!record) {
    return {
      valid: false,
      reason: "NOT_FOUND",
    };
  }

  if (!record.expiresAt || record.expiresAt < new Date()) {
    return {
      valid: false,
      reason: "EXPIRED",
    };
  }

  return {
    valid: true,
    expiresAt: record.expiresAt.toISOString(),
  };
}
