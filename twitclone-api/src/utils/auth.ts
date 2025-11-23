import { betterAuth } from "better-auth"
import { openAPI, username, apiKey } from "better-auth/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client";
import * as schema from "../db/schema";
import { generateId } from "./snowflake";
import { eq } from "drizzle-orm";
import sendEmail from "./email";
import { config } from "../config";
import {
    verificationEmailHtml,
    verificationEmailText,
    loginNotificationEmailHtml,
    loginNotificationEmailText,
    passwordResetEmailHtml,
    passwordResetEmailText,
    passwordResetConfirmationEmailHtml,
    passwordResetConfirmationEmailText
} from "./email-templates";
import { buildVerificationUrl, deriveFromAddress, getFriendlyName, getLocationFromIP, buildSignInUrl, buildResetPasswordUrl } from "./auth.service";



const fromAddress = deriveFromAddress();
const RESET_PASSWORD_TOKEN_EXPIRY_SECONDS = 60 * 60;
const RESET_PASSWORD_TOKEN_EXPIRY_MINUTES = Math.floor(RESET_PASSWORD_TOKEN_EXPIRY_SECONDS / 60);

export const auth = betterAuth({
    trustedOrigins: ["http://localhost:3001", "https://scream.aritra.ovh"],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    user: {
        additionalFields: {
            registered_from_ip: {
                type: "string",
                required: false,
                input: false,
            },
            last_login_ip: {
                type: "string",
                required: false,
                input: false,
            },
            last_activity_ip: {
                type: "string",
                required: false,
                input: false,
            }
        }
    },
    advanced: {
        database: {
            generateId: () => generateId().toString(),
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        resetPasswordTokenExpiresIn: RESET_PASSWORD_TOKEN_EXPIRY_SECONDS,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, token }) => {
            if (!user.email) {
                return;
            }
            const friendlyName = getFriendlyName(user.name, user.email);
            const resetUrl = buildResetPasswordUrl(token);
            await sendEmail({
                from: fromAddress,
                to: user.email,
                subject: "Reset your SCREAM password",
                text: passwordResetEmailText({
                    name: friendlyName,
                    resetUrl,
                    expiresInMinutes: RESET_PASSWORD_TOKEN_EXPIRY_MINUTES,
                }),
                html: passwordResetEmailHtml({
                    name: friendlyName,
                    resetUrl,
                    expiresInMinutes: RESET_PASSWORD_TOKEN_EXPIRY_MINUTES,
                }),
            });
        },
        onPasswordReset: async ({ user }) => {
            if (!user.email) {
                return;
            }
            const friendlyName = getFriendlyName(user.name, user.email);
            const signInUrl = buildSignInUrl();
            await sendEmail({
                from: fromAddress,
                to: user.email,
                subject: "Your SCREAM password was updated",
                text: passwordResetConfirmationEmailText({
                    name: friendlyName,
                    signInUrl,
                }),
                html: passwordResetConfirmationEmailHtml({
                    name: friendlyName,
                    signInUrl,
                }),
            });
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, token }) => {
            const verificationUrl = buildVerificationUrl(token, user.email);
            const friendlyName = getFriendlyName(user.name, user.email);

            await sendEmail({
                from: fromAddress,
                to: user.email,
                subject: "Verify your SCREAM account",
                text: verificationEmailText({
                    name: friendlyName,
                    verificationUrl,
                }),
                html: verificationEmailHtml({
                    name: friendlyName,
                    verificationUrl,
                }),
            });
        },
        async afterEmailVerification(user) {
            console.log(`[Auth] ${user.email} verified their email`);
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30,
        updateAge: 60 * 60,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60,
        }
    },
    plugins: [
        openAPI(),
        username(),
        apiKey(),
    ],
    databaseHooks: {
        user: {
            create: {
                before: async (user, context) => {
                    // Handle optional context
                    const ip = context?.headers?.get('x-forwarded-for') ||
                        context?.headers?.get('x-real-ip') ||
                        null;

                    return {
                        data: {
                            ...user,
                            registered_from_ip: ip,
                            last_login_ip: ip,
                            last_activity_ip: ip,
                        }
                    };
                }
            },
            update: {
                before: async (user, context) => {
                    const ip = context?.headers?.get('x-forwarded-for') ||
                        context?.headers?.get('x-real-ip') ||
                        null;
                    return {
                        data: {
                            ...user,
                            last_login_ip: ip,
                            last_activity_ip: ip,
                        }
                    };
                }
            }
        },
        session: {
            create: {
                before: async (session, context) => {
                    const ip = context?.headers?.get('x-forwarded-for') ||
                        context?.headers?.get('x-real-ip') ||
                        null;
                },
                after: async (session, context) => {
                    try {
                        const user = await db.query.user.findFirst({
                            where: eq(schema.user.id, BigInt(session.userId))
                        });

                        if (user && user.email) {
                            const friendlyName = getFriendlyName(user.name, user.email);

                            // Debug: Log all headers to see what's available (useful while wiring IPs)
                            console.log("[Auth] All headers received:", Object.fromEntries(context?.headers?.entries() || []));

                            const ip =
                                context?.headers?.get("x-forwarded-for") ||
                                context?.headers?.get("x-real-ip") ||
                                context?.headers?.get("cf-connecting-ip") ||
                                context?.headers?.get("x-client-ip") ||
                                context?.headers?.get("forwarded") ||
                                context?.headers?.get("x-cluster-client-ip") ||
                                context?.headers?.get("x-forwarded") ||
                                context?.headers?.get("forwarded-for") ||
                                null;

                            console.log("[Auth] Extracted IP:", ip);

                            const userAgent = context?.headers?.get("user-agent") || "Unknown Device";

                            // Get location data from IP (will be skipped locally when ip is null)
                            let locationData = null;
                            if (ip) {
                                locationData = await getLocationFromIP(ip);
                            }

                            await sendEmail({
                                from: fromAddress,
                                to: user.email,
                                subject: "New Login to SCREAM",
                                text: loginNotificationEmailText({
                                    name: friendlyName,
                                    time: new Date().toLocaleString(),
                                    ip: ip || undefined,
                                    city: locationData?.city,
                                    country: locationData?.country,
                                }),
                                html: loginNotificationEmailHtml({
                                    name: friendlyName,
                                    time: new Date().toLocaleString(),
                                    ip: ip || undefined,
                                    device: userAgent,
                                    city: locationData?.city,
                                    country: locationData?.country,
                                })
                            });
                        }
                    } catch (error) {
                        console.error("[Auth] Failed to send login notification email:", error);
                    }
                }
            },
            update: {
                before: async (session, context) => {
                    const ip = context?.headers?.get('x-forwarded-for') ||
                        context?.headers?.get('x-real-ip') ||
                        null;
                }
            }
        },
    }
})