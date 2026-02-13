"use client";

export type UploadFileType = "avatar" | "banner" | "image";
export type UploadTargetType = "user" | "post";

interface UploadImageOptions {
  file: File;
  fileType: UploadFileType;
  targetType: UploadTargetType;
  targetId: string;
  userId: string;
}

const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });

export const uploadImage = async ({
  file,
  fileType,
  targetType,
  targetId,
  userId,
}: UploadImageOptions): Promise<string | null> => {
  try {
    if (!targetId || !userId) {
      throw new Error("Missing target or user identifier for upload");
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const prefix = process.env.NEXT_PUBLIC_API_PREFIX;

    if (!baseUrl || !prefix) {
      throw new Error("Missing API configuration");
    }

    // Step 1: Get presigned URL
    const presignedResponse = await fetch(
      `${baseUrl}/${prefix}/upload?fileType=${fileType}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": file.type,
        },
      },
    );

    if (!presignedResponse.ok) {
      throw new Error("Failed to get upload URL");
    }

    const { uploadUrl, objectKey } = (await presignedResponse.json()) as {
      uploadUrl: string;
      objectKey: string;
    };

    // Step 2: Upload file to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to S3");
    }

    // Step 3: Get image dimensions
    const dimensions = await getImageDimensions(file);

    // Step 4: Save to database
    const mediaUrl = objectKey;
    const saveResponse = await fetch(`${baseUrl}/${prefix}/upload`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetType,
        targetId,
        userId,
        contentType: file.type,
        type: "image",
        mediaUrl,
        width: dimensions.width,
        height: dimensions.height,
      }),
    });

    if (!saveResponse.ok) {
      throw new Error("Failed to save upload info");
    }

    return mediaUrl;
  } catch (error) {
    console.error("Image upload failed:", error);
    return null;
  }
};
