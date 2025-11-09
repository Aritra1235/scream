interface Config {
    axiom: {
        token: string;
        dataset: string;
    };
    betterAuth: {
        secret: string;
        url: string;
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
}

const config: Config = {
    axiom: {
        token: process.env.AXIOM_TOKEN as string,
        dataset: process.env.AXIOM_DATASET as string,
    },
    betterAuth: {
        secret: process.env.BETTER_AUTH_SECRET as string,
        url: process.env.BETTER_AUTH_URL as string,
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
}

export { config };