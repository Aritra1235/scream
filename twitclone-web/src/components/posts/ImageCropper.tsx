"use client";

import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

interface CropAreaPixels {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ImageCropperProps {
  imageUrl: string;
  aspect?: number;
  onCancel: () => void;
  onComplete: (file: File) => void;
  fileName?: string;
}

async function getCroppedBlob(
  imageSrc: string,
  croppedAreaPixels: CropAreaPixels,
): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load image"));
  });

  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
}

export function ImageCropper({
  imageUrl,
  aspect = 4 / 3,
  onCancel,
  onComplete,
  fileName = "image.jpg",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CropAreaPixels | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback(
    (_: unknown, areaPixels: CropAreaPixels) => {
      setCroppedAreaPixels(areaPixels);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsSaving(true);
      const blob = await getCroppedBlob(imageUrl, croppedAreaPixels);
      const file = new File([blob], fileName, { type: blob.type });
      onComplete(file);
    } catch (error) {
      console.error("Failed to crop image", error);
      onCancel();
    } finally {
      setIsSaving(false);
    }
  }, [croppedAreaPixels, imageUrl, fileName, onComplete, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border-4 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] max-w-lg w-full mx-4">
        <div className="border-b-4 border-border px-4 py-3 flex items-center justify-between">
          <h2 className="font-black text-lg text-foreground uppercase">
            Adjust Image
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        <div className="relative w-full h-80 bg-muted">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="border-t-4 border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-bold uppercase">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-32 accent-foreground"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !croppedAreaPixels}
            className="rounded-none border-2 border-border bg-[#4ECDC4] px-6 py-2 font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:bg-[#45b8b0] hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:disabled:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all uppercase text-xs"
          >
            {isSaving ? "Cropping..." : "Use Image"}
          </button>
        </div>
      </div>
    </div>
  );
}
