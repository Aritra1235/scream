import { S3Client } from '@aws-sdk/client-s3';
import { config } from '../config/index';

const s3Client = new S3Client({
    region: config.aws.region,
    endpoint: config.aws.endpoint,
    // The custom S3-compatible endpoint serves buckets under /<bucket>/<key>.
    // Without this, the AWS SDK rewrites the host to <bucket>.<endpoint>, which
    // may not be covered by DNS/TLS and causes browsers to report a CORS failure.
    forcePathStyle: true,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    },
});

export { s3Client };
