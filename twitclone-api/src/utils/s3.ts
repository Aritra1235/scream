import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/index';
import { randomUUID } from 'crypto';



const s3Client = new S3Client({
    region: config.aws.region,
    endpoint: config.aws.endpoint,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    },
});



export { s3Client };