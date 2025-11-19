"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/user-store";
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

interface TweetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTweetPosted?: () => void;
}

const MAX_CHARACTERS = 280;

export function TweetModal({
  open,
  onOpenChange,
  onTweetPosted,
}: TweetModalProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();

  const characterCount = content.length;
  const remainingCharacters = MAX_CHARACTERS - characterCount;
  const isOverLimit = remainingCharacters < 0;
  const canPost = characterCount > 0 && !isOverLimit;

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/post/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            content: content.trim(),
            mediaCount: 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post tweet");
      }

      setContent("");
      handleClose();
      onTweetPosted?.();
      window.location.reload(); // Simple refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post tweet");
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
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 pointer-events-none">
        <div className="w-full max-w-xl bg-card border-4 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden mx-4 pointer-events-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-border bg-background">
            <button
              onClick={handleClose}
              className="rounded-none p-2 hover:bg-card border-2 border-transparent hover:border-border hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
            >
              <X className="h-6 w-6 text-foreground" />
            </button>
            <button className="text-foreground font-black text-sm uppercase tracking-wider hover:underline decoration-2 underline-offset-2">
              Drafts
            </button>
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
                placeholder="WHAT'S ON YOUR MIND?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[150px] w-full resize-none border-4 border-border bg-background p-4 text-xl font-bold placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus-visible:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-shadow rounded-none text-foreground mb-4"
              />

              <div className="border-t-4 border-border pt-4 flex items-center justify-between">
                <div className="flex gap-2 text-foreground">
                  <button className="border-2 border-transparent p-2 hover:border-border hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:translate-x-0.5">
                    <ImageIcon className="h-6 w-6" />
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
                    {isPosting ? "SCREAMING..." : "SCREAM"}
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

