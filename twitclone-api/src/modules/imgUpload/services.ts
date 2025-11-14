import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/index';
import { randomUUID } from 'crypto';
import { s3Client } from '../../utils/s3';
import { db } from '../../db/client';
import { media } from '../../db/schema';
import { generateId } from '../../utils/snowflake';

interface PresignedUrlOptions {
    fileType: 'avatar' | 'banner' | 'image' | 'video';
    userId: string;
    contentType: string;
    fileName?: string;
}

interface PresignedUrlResponse {
    uploadUrl: string;
    objectKey: string;
}

async function generatePresignedUrl(options: PresignedUrlOptions): Promise<PresignedUrlResponse> {
    const { fileType, contentType } = options;
    
    // Generate unique object key using just UUID
    const objectId = randomUUID();
    const objectKey = `${fileType}s/${objectId}`;
    
    // Create PUT command with explicit ContentType
    const putCommand = new PutObjectCommand({
        Bucket: config.aws.bucketName,
        Key: objectKey,
        ContentType: contentType,
    });
    
    // Generate presigned URL (expires in 15 minutes)
    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 900 });
    console.log("uploadUrl", uploadUrl);
    return {
        uploadUrl,
        objectKey,
    };
}

async function generateAvatarUploadUrl(userId: string, contentType: string): Promise<PresignedUrlResponse> {
    console.log("generateAvatarUploadUrl", userId, contentType);
    return generatePresignedUrl({
        fileType: 'avatar',
        userId,
        contentType,
    });
}

async function generateBannerUploadUrl(userId: string, contentType: string): Promise<PresignedUrlResponse> {
    return generatePresignedUrl({
        fileType: 'banner',
        userId,
        contentType,
    });
}

async function generateImageUploadUrl(userId: string, contentType: string): Promise<PresignedUrlResponse> {
    return generatePresignedUrl({
        fileType: 'image',
        userId,
        contentType,
    });
}

async function uploadedImageToDb(targetType: 'user' | 'post', targetId: bigint, userId: bigint, contentType: string, type: any ,mediaUrl: string, width: number, height: number): Promise<Boolean> {
    const upload = await db.insert(media).values({
        id: generateId(),
        targetType,
        targetId,
        userId,
        contentType,
        type,
        mediaUrl,
        width,
        height,
    }).returning();
    if(!upload) {
        return false;
    }
    return true;
}

export { generateAvatarUploadUrl, generateBannerUploadUrl, generateImageUploadUrl, uploadedImageToDb };
