import Elysia from "elysia";
import { auth } from "../../utils/auth";
import { apiPrefix } from "../../utils/const";
import { generateAvatarUploadUrl, generateBannerUploadUrl, generateImageUploadUrl, uploadedImageToDb } from "./services";
import { fileTypeSchema, uploadInfoSchema } from "./model";


const imgUpload = new Elysia({ name: "imgUpload", prefix: apiPrefix })
    .get('/upload', async ({ request: { headers }, status, query }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const userId = session?.user.id;

        const contentType = headers.get('content-type');
        if(!contentType) {
            return status(400, { message: "Content type is required" });
        }
        let uploadUrl = {};
        if(query.fileType === 'avatar') {
            uploadUrl = await generateAvatarUploadUrl(userId, contentType);
        } else if(query.fileType === 'banner') {
            uploadUrl = await generateBannerUploadUrl(userId, contentType);
        } else if(query.fileType === 'image') {
            uploadUrl = await generateImageUploadUrl(userId, contentType);
        } //else if(query.fileType === 'video') {
            //const uploadUrl = await generateVideoUploadUrl(userId, contentType);
        //}
        console.log("uploadUrl", uploadUrl);
        return uploadUrl;
    }, {
        query: fileTypeSchema
    })

    .post('/upload', async ({ request: { headers }, status, body }) => {
        const session = await auth.api.getSession({
            headers
        });
        if (!session) {
            return status(401, { message: "Unauthorized" });
        }
        const userId = session?.user.id;
        
        if(body.targetType === 'user') {
            const uploaded = await uploadedImageToDb(body.targetType, BigInt(userId), BigInt(userId), body.contentType, body.type, body.mediaUrl, body.width, body.height);
            if(!uploaded) {
                return status(500, { message: "Failed to upload image to database" });
            }
            return { message: "ok" };
        }
        return { message: "Wrong target type" };
    }, {
        body: uploadInfoSchema
    })

export { imgUpload };