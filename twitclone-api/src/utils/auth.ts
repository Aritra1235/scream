import { betterAuth } from "better-auth"
import { openAPI } from "better-auth/plugins"

export const auth = betterAuth({
    plugins: [ 
        openAPI(), 
    ] 
})