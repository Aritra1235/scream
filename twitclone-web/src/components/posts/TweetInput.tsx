"use client";

import { useState, useRef, useEffect, DragEvent } from "react";
import { useUserStore } from "@/store/user-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Image as ImageIcon,
    FileVideo,
    Smile,
    Calendar,
    MapPin,
    Globe,
} from "lucide-react";
import { ImageCropper } from "./ImageCropper";
import { uploadImage } from "@/lib/upload-image";

interface SelectedImage {
    id: string;
    file: File;
    previewUrl: string;
}

type ComposerVariant = "post" | "reply" | "quote";

interface TweetInputProps {
    parentId?: string;
    repostOf?: string;
    variant?: ComposerVariant;
    placeholder?: string;
    autoRefresh?: boolean;
    onSuccess?: (post?: any) => void;
}

const MAX_IMAGES = 4;

export function TweetInput({
    parentId,
    repostOf,
    variant = "post",
    placeholder,
    autoRefresh = true,
    onSuccess,
}: TweetInputProps) {
    const { user } = useUserStore();
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [images, setImages] = useState<SelectedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [croppingImage, setCroppingImage] = useState<SelectedImage | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        return () => {
            images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        };
    }, [images]);

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;

        const existingCount = images.length;
        const availableSlots = MAX_IMAGES - existingCount;
        if (availableSlots <= 0) return;

        const accepted: SelectedImage[] = [];
        Array.from(fileList)
            .filter((file) => file.type.startsWith("image/"))
            .slice(0, availableSlots)
            .forEach((file) => {
                const id = crypto.randomUUID();
                const previewUrl = URL.createObjectURL(file);
                accepted.push({ id, file, previewUrl });
            });

        if (accepted.length > 0) {
            setImages((prev) => [...prev, ...accepted]);
        }
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(event.target.files);
        // reset value so selecting the same file again triggers change
        event.target.value = "";
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
    };

    const handleRemoveImage = (id: string) => {
        setImages((prev) => {
            const remaining = prev.filter((img) => img.id !== id);
            const removed = prev.find((img) => img.id === id);
            if (removed) {
                URL.revokeObjectURL(removed.previewUrl);
            }
            return remaining;
        });
    };

    const handleStartCrop = (image: SelectedImage) => {
        setCroppingImage(image);
    };

    const handleCropComplete = (file: File) => {
        if (!croppingImage) return;
        const newPreview = URL.createObjectURL(file);
        setImages((prev) =>
            prev.map((img) => {
                if (img.id === croppingImage.id) {
                    URL.revokeObjectURL(img.previewUrl);
                    return {
                        ...img,
                        file,
                        previewUrl: newPreview,
                    };
                }
                return img;
            })
        );
        setCroppingImage(null);
    };

    const handleCropCancel = () => {
        setCroppingImage(null);
    };

    const handlePost = async () => {
        const requiresContent = variant !== "quote";
        if (requiresContent && !content.trim()) return;
        if (variant === "reply" && !parentId) return;
        if (variant === "quote" && !repostOf) return;

        setIsPosting(true);
        try {
            const hasImages = images.length > 0;
            const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}`;

            let endpoint = `${baseUrl}/post/create`;
            const payload: Record<string, any> = {
                content: content.trim(),
                mediaCount: hasImages ? images.length : 0,
            };

            if (variant === "reply" && parentId) {
                endpoint = `${baseUrl}/post/reply`;
                payload.parentId = parentId;
            } else if (variant === "quote" && repostOf) {
                endpoint = `${baseUrl}/post/quote`;
                payload.repostOf = repostOf;
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                const postId: string | undefined = data?.post?.id;

                if (hasImages && postId && user?.id) {
                    for (const img of images) {
                        await uploadImage({
                            file: img.file,
                            fileType: "image",
                            targetType: "post",
                            targetId: postId,
                            userId: user.id,
                        });
                    }
                }

                setContent("");
                setImages((prev) => {
                    prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
                    return [];
                });

                onSuccess?.(data?.post);
                if (autoRefresh) {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error("Failed to post tweet:", error);
        } finally {
            setIsPosting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="border-b-4 border-border px-4 py-6 bg-card">
            <div className="flex gap-4">
                <div className="h-12 w-12 border-2 border-border bg-muted overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    {user.avatar_url ? (
                        <img
                            src={user.avatar_url}
                            alt={user.name || "User"}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-[#FFE66D]" />
                    )}
                </div>
                <div className="flex-1">
                    <div
                        className={`border-4 border-border bg-background p-0 transition-shadow rounded-none ${
                            isDragging
                                ? "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                                : ""
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <Textarea
                            placeholder={
                                placeholder ||
                                (variant === "reply"
                                    ? "Reply to this post..."
                                    : variant === "quote"
                                        ? "Add your take (optional)..."
                                        : "WHAT'S ON YOUR MIND?")
                            }
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[100px] w-full resize-none border-none bg-transparent p-4 text-xl font-bold placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:shadow-none focus-visible:outline-none"
                        />
                        {images.length > 0 && (
                            <div className="px-4 pb-4">
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {images.map((img) => (
                                        <div
                                            key={img.id}
                                            className="relative group border-2 border-border bg-muted overflow-hidden aspect-square shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                                        >
                                            <img
                                                src={img.previewUrl}
                                                alt="Selected"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(img.id)}
                                                className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 font-bold uppercase"
                                            >
                                                Remove
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleStartCrop(img)}
                                                className="absolute bottom-1 left-1 bg-background/90 text-foreground text-xs px-2 py-1 font-bold uppercase border border-border"
                                            >
                                                Crop
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {images.length < MAX_IMAGES && (
                                    <p className="mt-2 text-xs text-muted-foreground font-bold uppercase">
                                        Drag and drop more images or use the button below (up to{" "}
                                        {MAX_IMAGES}).
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2 text-foreground">
                            <button
                                type="button"
                                onClick={handleImageButtonClick}
                                className="group border-2 border-transparent p-2 hover:border-border hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:translate-x-0.5 active:scale-95 disabled:opacity-50"
                                disabled={images.length >= MAX_IMAGES}
                                aria-label="Add images"
                            >
                                <ImageIcon className="h-6 w-6 text-foreground" />
                            </button>
                            {/*
                            <button className="border-2 border-transparent p-2 hover:border-border hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:translate-x-0.5">
                                <FileVideo className="h-6 w-6" />
                            </button>
                            <button className="border-2 border-transparent p-2 hover:border-border hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:translate-x-0.5">
                                <Smile className="h-6 w-6" />
                            </button>
                            <button className="border-2 border-transparent p-2 hover:border-border hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:translate-x-0.5">
                                <Calendar className="h-6 w-6" />
                            </button>
                            <button className="border-2 border-transparent p-2 hover:border-border hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:translate-x-0.5">
                                <MapPin className="h-6 w-6" />
                            </button>
                            */}
                        </div>
                        <Button
                            onClick={handlePost}
                            disabled={
                                isPosting ||
                                (variant !== "quote" && !content.trim()) ||
                                (variant === "reply" && !parentId) ||
                                (variant === "quote" && !repostOf)
                            }
                            className="rounded-none border-2 border-border bg-[#4ECDC4] px-8 py-6 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-[#45b8b0] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:disabled:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all uppercase"
                        >
                            {isPosting
                                ? "SCREAMING..."
                                : variant === "reply"
                                    ? "REPLY"
                                    : variant === "quote"
                                        ? "QUOTE"
                                        : "SCREAM"}
                        </Button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileInputChange}
                    />
                </div>
            </div>
            {croppingImage && (
                <ImageCropper
                    imageUrl={croppingImage.previewUrl}
                    onCancel={handleCropCancel}
                    onComplete={handleCropComplete}
                    fileName={croppingImage.file.name}
                />
            )}
        </div>
    );
}

