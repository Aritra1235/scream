import { normalizeConfiguredUrl, parseConfiguredUrls, toUniqueOrigins } from "../utils/url-config";

interface Config {
    axiom: {
        token: string;
        dataset: string;
    };
    email: {
        mailgunApiKey: string;
        mailgunDomain: string;
        dontSendEmail: string;
    };
    betterAuth: {
        secret: string;
        url: string;
        trustedOrigins: string[];
    };
    database: {
        url: string;
    };
    cdn: {
        baseUrl: string;
        defaultAvatar: string;
        defaultBanner: string;
    };
    aws: {
        region: string;
        endpoint: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucketName: string;
    };
    misc:{
        port: number;
        webUrl: string;
        webUrls: string[];
        corsOrigins: string[];
    }
}

const defaultApiUrl = normalizeConfiguredUrl(`localhost:${process.env.PORT || "3000"}`);
const defaultWebUrl = normalizeConfiguredUrl("localhost:3001");
const webUrls = parseConfiguredUrls(process.env.WEB_URLS, process.env.WEB_URL);
const resolvedWebUrls = webUrls.length > 0 ? webUrls : [defaultWebUrl];
const corsOrigins = toUniqueOrigins(
    parseConfiguredUrls(
        process.env.CORS_ALLOWED_ORIGINS,
        process.env.CORS_ORIGINS,
        process.env.WEB_URLS,
        process.env.WEB_URL,
    ),
);
const resolvedCorsOrigins = corsOrigins.length > 0 ? corsOrigins : toUniqueOrigins(resolvedWebUrls);
const betterAuthTrustedOrigins = toUniqueOrigins(
    parseConfiguredUrls(
        process.env.BETTER_AUTH_TRUSTED_ORIGINS,
        process.env.BETTER_AUTH_URLS,
        process.env.CORS_ALLOWED_ORIGINS,
        process.env.CORS_ORIGINS,
        process.env.WEB_URLS,
        process.env.WEB_URL,
    ),
);

const config: Config = {
    axiom: {
        token: process.env.AXIOM_TOKEN as string,
        dataset: process.env.AXIOM_DATASET as string,
    },
    email: {
        mailgunApiKey: process.env.MAILGUN_API_KEY as string,
        mailgunDomain: process.env.MAILGUN_DOMAIN as string,
        dontSendEmail: process.env.DONT_SEND_EMAIL as string,
    },
    betterAuth: {
        secret: process.env.BETTER_AUTH_SECRET as string,
        url: normalizeConfiguredUrl(process.env.BETTER_AUTH_BASE_URL ?? process.env.BETTER_AUTH_URL) || defaultApiUrl,
        trustedOrigins:
            betterAuthTrustedOrigins.length > 0 ? betterAuthTrustedOrigins : resolvedCorsOrigins,
    },
    database: {
        url: process.env.DATABASE_URL as string,
    },
    cdn: {
        baseUrl: process.env.CDN_BASE_URL as string,
        defaultAvatar: process.env.DEFAULT_AVATAR_OBJECT as string,
        defaultBanner: process.env.DEFAULT_BANNER_OBJECT as string,
    },
    aws: {
        endpoint: process.env.AWS_ENDPOINT as string,
        region: process.env.AWS_REGION as string,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        bucketName: process.env.AWS_S3_BUCKET_NAME as string,
    },
    misc: {
        port: parseInt(process.env.PORT as string, 10),
        webUrl: resolvedWebUrls[0],
        webUrls: resolvedWebUrls,
        corsOrigins: resolvedCorsOrigins,
    },

}

export { config };
