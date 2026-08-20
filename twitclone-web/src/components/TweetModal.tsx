"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/user-store";
import { DEFAULT_AVATAR_KEY, resolveImageUrl } from "@/lib/image-url";
import {
  X,
  Image as ImageIcon,
  FileVideo,
  List,
  Smile,
  Calendar,
  MapPin,
  Globe,
} from "lucide-react";

type ComposeVariant = "post" | "repost";

type RepostTarget = {
  id: string;
  content?: string;
  author?: {
    displayName?: string | null;
    username?: string | null;
    avatar?: string | null;
  };
  media?: {
    mediaUrl: string;
    type: string;
    width: number | null;
    height: number | null;
    contentType: string;
  }[];
};

interface TweetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTweetPosted?: () => void;
  variant?: ComposeVariant;
  repostTarget?: RepostTarget;
}

const MAX_CHARACTERS = 280;

export function TweetModal({
  open,
  onOpenChange,
  onTweetPosted,
  variant = "post",
  repostTarget,
}: TweetModalProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();

  const characterCount = content.length;
  const remainingCharacters = MAX_CHARACTERS - characterCount;
  const isOverLimit = remainingCharacters < 0;
  const isRepost = variant === "repost" && repostTarget?.id;
  const canPost =
    !isOverLimit &&
    (isRepost ? Boolean(repostTarget?.id) : characterCount > 0);

  const resolvedRepostTarget = useMemo(() => {
    if (!repostTarget) return null;
    const resolvedAvatar = resolveAvatarUrl(repostTarget.author?.avatar);
    const resolvedMedia = (repostTarget.media || []).map((item) => ({
      ...item,
      mediaUrl: resolveMediaUrl(item.mediaUrl),
    }));
    return {
      ...repostTarget,
      author: {
        displayName:
          repostTarget.author?.displayName ||
          repostTarget.author?.username ||
          "User",
        username: repostTarget.author?.username || "unknown",
        avatar: resolvedAvatar,
      },
      content: repostTarget.content || "",
      media: resolvedMedia,
    };
  }, [repostTarget]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setContent("");
      setError(null);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleClose = () => {
    setContent("");
    setError(null);
    onOpenChange(false);
  };

  const handlePost = async () => {
    if (!canPost) return;

    setIsPosting(true);
    setError(null);

    try {
      const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}`;
      const trimmed = content.trim();
      let endpoint = `${baseUrl}/post/create`;
      let body: Record<string, any> = {
        content: trimmed,
        mediaCount: 0,
      };

      if (isRepost && repostTarget?.id) {
        const isQuote = trimmed.length > 0;
        endpoint = `${baseUrl}/post/${isQuote ? "quote" : "repost"}`;
        body = {
          repostOf: repostTarget.id,
          content: trimmed,
          mediaCount: 0,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to post");
      }

      setContent("");
      handleClose();
      onTweetPosted?.();
      window.location.reload(); // Simple refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canPost) {
      handlePost();
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        role="presentation"
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 pointer-events-none">
        <div className="w-full max-w-lg bg-card border-4 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden mx-4 pointer-events-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-border bg-background">
            <button
              onClick={handleClose}
              className="rounded-none p-2 hover:bg-card border-2 border-transparent hover:border-border hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
            >
              <X className="h-6 w-6 text-foreground" />
            </button>
            <div className="text-foreground font-black text-sm uppercase tracking-wider">
              {isRepost ? "Repost" : "Compose"}
            </div>
          </div>

          <div className="p-6 flex gap-4">
            <div className="h-12 w-12 border-2 border-border bg-muted overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#FFE66D]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Textarea
                placeholder={
                  isRepost
                    ? "Add a comment (optional)..."
                    : "WHAT'S ON YOUR MIND?"
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[150px] w-full resize-none border-4 border-border bg-background p-4 text-xl font-bold placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus-visible:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-shadow rounded-none text-foreground mb-4"
              />

              {isRepost && resolvedRepostTarget && (
                <div className="mb-4 border-2 border-border bg-muted p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={
                        resolvedRepostTarget.author?.avatar ||
                        resolveImageUrl(DEFAULT_AVATAR_KEY)
                      }
                      alt="Repost target avatar"
                      className="w-8 h-8 border border-border object-cover bg-card"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase">
                        {resolvedRepostTarget.author?.displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{resolvedRepostTarget.author?.username}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                    {resolvedRepostTarget.content || "No content"}
                  </div>
                  {resolvedRepostTarget.media && resolvedRepostTarget.media.length > 0 && (
                    <div className="mt-3 max-h-56 overflow-hidden rounded-sm border border-border bg-card/40">
                      <div
                        className={`grid gap-1 ${resolvedRepostTarget.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                      >
                        {resolvedRepostTarget.media.slice(0, 4).map((item, index) => (
                          <div
                            key={`${item.mediaUrl}-${index}`}
                            className={`w-full ${resolvedRepostTarget.media.length === 1 ? "h-full" : "aspect-square"}`}
                          >
                            <img
                              src={item.mediaUrl}
                              alt="Repost media"
                              className={`w-full h-full object-contain bg-muted ${resolvedRepostTarget.media.length === 1 ? "max-h-56" : "max-h-40"}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t-4 border-border pt-4 flex items-center justify-between">
                <div className="flex gap-2 text-foreground">
                  <button className="group border-2 border-transparent p-2 hover:border-border hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:translate-x-0.5 active:scale-95">
                    <ImageIcon className="h-6 w-6 text-foreground" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {characterCount > 0 && (
                    <div className="relative h-8 w-8 flex items-center justify-center font-bold text-xs">
                      <span className={isOverLimit ? "text-red-600" : "text-foreground"}>
                        {remainingCharacters}
                      </span>
                    </div>
                  )}
                  <Button
                    onClick={handlePost}
                    disabled={!canPost || isPosting}
                    className="rounded-none border-2 border-border bg-[#4ECDC4] px-8 py-6 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-[#45b8b0] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:disabled:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all uppercase"
                  >
                    {isPosting
                      ? "Posting..."
                      : isRepost
                        ? trimmedLabel(content)
                        : "SCREAM"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function trimmedLabel(text: string) {
  return text.trim().length > 0 ? "Quote" : "Repost";
}

function resolveAvatarUrl(avatar?: string | null) {
  return avatar ? resolveImageUrl(avatar) : null;
}

function resolveMediaUrl(url: string) {
  return resolveImageUrl(url);
}
