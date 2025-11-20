import { betterAuth } from "better-auth"
import { openAPI, username, apiKey } from "better-auth/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client";
import * as schema from "../db/schema";
import { generateId } from "./snowflake";

export const auth = betterAuth({
    trustedOrigins: ["http://localhost:3000", "https://scream.aritra.ovh"],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    advanced: {
        database: {
            generateId: () => generateId().toString(),
        },
    },
    emailAndPassword: { 
        enabled: true, 
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60, // 1 hour
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60, // 1 hour
        }
    },
    plugins: [ 
        openAPI(), 
        username(),
        apiKey(),
    ] 
})