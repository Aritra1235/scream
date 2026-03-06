import { config } from "../config";

interface IPLocationData {
    status: string;
    country?: string;
    countryCode?: string;
    region?: string;
    regionName?: string;
    city?: string;
    zip?: string;
    lat?: number;
    lon?: number;
    timezone?: string;
    isp?: string;
    org?: string;
    as?: string;
    query?: string;
}

async function getLocationFromIP(ip: string): Promise<{ city?: string; country?: string } | null> {
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);

        if (!response.ok) {
            console.warn(`[IP Location] Failed to fetch location for IP ${ip}: ${response.status}`);
            return null;
        }

        const data: IPLocationData = await response.json();

        if (data.status !== 'success') {
            console.warn(`[IP Location] API returned unsuccessful status for IP ${ip}:`, data);
            return null;
        }

        return {
            city: data.city,
            country: data.country
        };
    } catch (error) {
        console.warn(`[IP Location] Error fetching location for IP ${ip}:`, error);
        return null;
    }
}



function resolveWebAppUrl() {
    return config.misc.webUrl;
}

const webAppBaseUrl = resolveWebAppUrl();



function deriveFromAddress() {
    const envFrom = process.env.EMAIL_FROM || process.env.MAIL_FROM_ADDRESS;
    if (envFrom) {
        return envFrom;
    }
    if (config.email.mailgunDomain) {
        return `SCREAM <no-reply@${config.email.mailgunDomain}>`;
    }
    return "SCREAM <no-reply@scream.local>";
}

function buildVerificationUrl(token: string, email: string) {
    const url = new URL("/verify-email", webAppBaseUrl);
    url.searchParams.set("token", token);
    url.searchParams.set("email", email);
    return url.toString();
}

function buildResetPasswordUrl(token: string) {
    const url = new URL("/reset-password", webAppBaseUrl);
    url.searchParams.set("token", token);
    return url.toString();
}

function buildSignInUrl() {
    const url = new URL("/sign-in", webAppBaseUrl);
    return url.toString();
}

function getFriendlyName(name?: string | null, email?: string | null) {
    if (name && name.trim().length > 0) {
        return name.trim().split(" ")[0];
    }
    return email ?? "there";
}

export { getLocationFromIP, buildVerificationUrl, buildResetPasswordUrl, getFriendlyName , deriveFromAddress, buildSignInUrl, resolveWebAppUrl};
