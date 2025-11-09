import * as v from 'valibot';

const fileTypeSchema = v.object({
    fileType: v.picklist(['avatar', 'banner', 'image'], 'File type must be either "avatar" or "banner" or "image"')
});

const uploadInfoSchema = v.object({
    targetType: v.picklist(['user', 'post'], 'Target type must be either "user" or "post"'),
    targetId: v.string(),
    userId: v.string(),
    contentType: v.string(),
    type: v.picklist(['image'], 'Media type must be image'),
    mediaUrl: v.string(),
    width: v.number(),
    height: v.number(),
});


export { fileTypeSchema, uploadInfoSchema };
