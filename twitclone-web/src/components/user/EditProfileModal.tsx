"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { uploadImage } from "@/lib/upload-image";
import { useUserStore } from "@/store/user-store";

type EditableUser = {
  id: string;
  username: string;
  display_name?: string;
  name?: string;
  bio?: string;
  avatar_url: string;
  banner_url: string;
  verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  createdAt: string;
};

type EditProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: EditableUser;
  onUpdated?: (user: EditableUser) => void;
};

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export function EditProfileModal({
  open,
  onOpenChange,
  user,
  onUpdated,
}: EditProfileModalProps) {
  const { fetchUser } = useUserStore();

  const [displayName, setDisplayName] = useState(user.display_name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [bannerKey, setBannerKey] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url);
  const [bannerPreview, setBannerPreview] = useState(user.banner_url);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDisplayName(user.display_name ?? "");
    setUsername(user.username ?? "");
    setAvatarKey(null);
    setBannerKey(null);
    setAvatarPreview(user.avatar_url);
    setBannerPreview(user.banner_url);
    setError(null);
    setUsernameError(null);
  }, [open, user]);

  const normalizedOriginalUsername = useMemo(
    () => (user.username || "").toLowerCase(),
    [user.username]
  );

  useEffect(() => {
    if (!open) return;
    const trimmed = username.trim();

    if (!trimmed) {
      setUsernameError("Username is required");
      return;
    }

    if (trimmed.length < 3) {
      setUsernameError("Username must be at least 3 characters long");
      return;
    }

    if (!USERNAME_PATTERN.test(trimmed)) {
      setUsernameError("Only letters, numbers, and underscores are allowed");
      return;
    }

    const normalized = trimmed.toLowerCase();
    if (normalized === normalizedOriginalUsername) {
      setUsernameError(null);
      setIsCheckingUsername(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const available = await checkUsernameAvailability(normalized, controller.signal);
        setUsernameError(available ? null : "This username is already taken");
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setUsernameError("Unable to check username right now");
        }
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [username, normalizedOriginalUsername, open]);

  const handleFileChange =
    (type: "avatar" | "banner") => async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const isAvatar = type === "avatar";
      const setUploading = isAvatar ? setIsUploadingAvatar : setIsUploadingBanner;
      const setKey = isAvatar ? setAvatarKey : setBannerKey;
      const setPreview = isAvatar ? setAvatarPreview : setBannerPreview;

      setUploading(true);
      setError(null);

      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      try {
        const uploadedKey = await uploadImage({
          file,
          fileType: isAvatar ? "avatar" : "banner",
          targetType: "user",
          targetId: user.id,
          userId: user.id,
        });

        if (!uploadedKey) {
          throw new Error("Upload failed");
        }

        setKey(uploadedKey);
        setPreview(buildCdnUrl(uploadedKey));
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        setError(`Failed to upload ${isAvatar ? "profile" : "banner"} image. Please try again.`);
        setPreview(isAvatar ? user.avatar_url : user.banner_url);
      } finally {
        setUploading(false);
      }
    };

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    const normalizedUsername = username.trim().toLowerCase();

    if (!trimmedName) {
      setError("Name is required");
      return;
    }

    if (!normalizedUsername) {
      setUsernameError("Username is required");
      return;
    }

    if (usernameError) {
      return;
    }

    if (isCheckingUsername) {
      return;
    }

    const payload: Record<string, string> = {};

    if (trimmedName !== (user.display_name || "")) {
      payload.display_name = trimmedName;
    }

    if (normalizedUsername !== normalizedOriginalUsername) {
      payload.username = normalizedUsername;
    }

    const currentAvatarKey = stripCdnUrl(user.avatar_url);
    if (avatarKey && avatarKey !== currentAvatarKey) {
      payload.avatar_url = avatarKey;
    }

    const currentBannerKey = stripCdnUrl(user.banner_url);
    if (bannerKey && bannerKey !== currentBannerKey) {
      payload.banner_url = bannerKey;
    }

    setIsSaving(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const prefix = process.env.NEXT_PUBLIC_API_PREFIX;
      const response = await fetch(`${baseUrl}/${prefix}/profile/me`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 409) {
        setUsernameError("This username is already taken");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      onUpdated?.(data.user);
      fetchUser();
      onOpenChange(false);
    } catch (saveError) {
      console.error("Failed to update profile:", saveError);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card border-4 border-border shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] rounded-none">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">
            Edit profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-semibold">
            Update how others see you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="relative h-32 sm:h-44 w-full border-2 border-border bg-muted overflow-hidden">
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500" />
            )}
            <label className="absolute bottom-2 right-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange("banner")}
              />
              <span className="inline-flex items-center gap-2 bg-background/90 px-3 py-2 border-2 border-border text-sm font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:-translate-y-0.5 hover:translate-x-0.5 transition-all">
                {isUploadingBanner ? (
                  <>
                    <Spinner className="size-4" />
                    Uploading...
                  </>
                ) : (
                  "Change banner"
                )}
              </span>
            </label>
          </div>

          <div className="flex items-end gap-4">
            <div className="relative -mt-12 h-24 w-24 border-4 border-background bg-background shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <img
                src={avatarPreview || "/default-avatar.png"}
                alt="Avatar preview"
                className="w-full h-full object-cover bg-muted"
              />
              <label className="absolute bottom-1 right-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange("avatar")}
                />
                <span className="inline-flex items-center gap-1 bg-background/90 px-2 py-1 border-2 border-border text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:-translate-y-0.5 hover:translate-x-0.5 transition-all">
                  {isUploadingAvatar ? (
                    <>
                      <Spinner className="size-3" />
                      Uploading
                    </>
                  ) : (
                    "Change"
                  )}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-black uppercase tracking-tight">Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black uppercase tracking-tight">Username</Label>
                {isCheckingUsername && <Spinner className="size-4 text-muted-foreground" />}
              </div>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                aria-invalid={Boolean(usernameError)}
              />
              <p className={`text-xs font-semibold ${usernameError ? "text-destructive" : "text-muted-foreground"}`}>
                {usernameError
                  ? usernameError
                  : "Only letters, numbers, and underscores. Minimum 3 characters."}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-sm border-2 border-destructive/50 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-none border-2 border-border font-black uppercase"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isUploadingAvatar || isUploadingBanner}
            className="rounded-none border-2 border-border bg-[#4ECDC4] text-black font-black uppercase px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function checkUsernameAvailability(username: string, signal?: AbortSignal) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const prefix = process.env.NEXT_PUBLIC_API_PREFIX;
    const response = await fetch(`${baseUrl}/${prefix}/username/${username}`, {
      credentials: "include",
      signal,
    });
    if (!response.ok) {
      return false;
    }
    const result = await response.json();
    return !result.usernameExists;
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    return false;
  }
}

function stripCdnUrl(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  const base = process.env.NEXT_PUBLIC_CDN_BASE_URL?.replace(/\/+$/, "");
  if (base && trimmed.startsWith(base)) {
    const withoutBase = trimmed.slice(base.length);
    return withoutBase.startsWith("/") ? withoutBase.slice(1) : withoutBase;
  }
  return trimmed.replace(/^\/+/, "");
}

function buildCdnUrl(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  const base = process.env.NEXT_PUBLIC_CDN_BASE_URL?.replace(/\/+$/, "");
  if (base) {
    return `${base}/${trimmed.replace(/^\/+/, "")}`;
  }
  return trimmed;
}

