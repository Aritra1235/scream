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
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24">
        <div className="w-full max-w-xl rounded-2xl bg-black border border-neutral-800 shadow-2xl overflow-hidden mx-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <button
              onClick={handleClose}
              className="rounded-full p-2 hover:bg-neutral-900 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <button className="text-blue-400 font-bold text-sm hover:text-blue-300 transition-colors">
              Drafts
            </button>
          </div>

          <div className="p-4 flex gap-4">
            <div className="h-10 w-10 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[120px] w-full resize-none border-none bg-transparent dark:bg-transparent p-0 text-xl placeholder:text-neutral-500 focus-visible:ring-0 text-white"
              />



              <div className="border-t border-neutral-800 pt-3 flex items-center justify-between">
                <div className="flex gap-0.5 text-blue-400">
                  <button className="rounded-full p-2 hover:bg-blue-500/10 transition-colors">
                    <ImageIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {characterCount > 0 && (
                    <div className="relative h-6 w-6 flex items-center justify-center">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="#333"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke={
                            isOverLimit
                              ? "#ef4444"
                              : remainingCharacters <= 20
                                ? "#eab308"
                                : "#3b82f6"
                          }
                          strokeWidth="2"
                          strokeDasharray={`${(Math.min(characterCount, MAX_CHARACTERS) / MAX_CHARACTERS) * 62.83} 62.83`}
                        />
                      </svg>
                    </div>
                  )}
                  <Button
                    onClick={handlePost}
                    disabled={!canPost || isPosting}
                    className="rounded-full bg-blue-500 px-6 font-bold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPosting ? "Posting..." : "Post"}
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

