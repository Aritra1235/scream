import { betterAuth } from "better-auth"
import { openAPI } from "better-auth/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client"; // your drizzle instance

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: { 
        enabled: true, 
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 10, // 10 seconds
        cookieCache: {
            enabled: true,
            maxAge: 5*60, // 5 minutes
        }
    },
    plugins: [ 
        openAPI(), 
    ] 
})