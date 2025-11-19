"use client";

import { useState } from "react";
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

export function TweetInput() {
    const { user } = useUserStore();
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const handlePost = async () => {
        if (!content.trim()) return;

        setIsPosting(true);
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

            if (response.ok) {
                setContent("");
                // Optionally trigger a feed refresh here if we had a way to do it
                // For now, the user might need to refresh or we can use a global event/store
                window.location.reload(); // Simple way to refresh feed for now
            }
        } catch (error) {
            console.error("Failed to post tweet:", error);
        } finally {
            setIsPosting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="border-b border-neutral-800 px-4 py-4">
            <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
                    {user.avatar_url ? (
                        <img
                            src={user.avatar_url}
                            alt={user.name || "User"}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500" />
                    )}
                </div>
                <div className="flex-1">
                    <Textarea
                        placeholder="What's happening?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[50px] w-full resize-none border-none bg-transparent dark:bg-transparent p-0 text-xl placeholder:text-neutral-500 focus-visible:ring-0"
                    />
                    <div className="mt-2 flex items-center justify-between border-t border-neutral-800 pt-3">
                        <div className="flex gap-2 text-blue-400">
                            <button className="rounded-full p-2 hover:bg-blue-500/10 transition-colors">
                                <ImageIcon className="h-5 w-5" />
                            </button>
                            <button className="rounded-full p-2 hover:bg-blue-500/10 transition-colors">
                                <FileVideo className="h-5 w-5" />
                            </button>
                            <button className="rounded-full p-2 hover:bg-blue-500/10 transition-colors">
                                <Smile className="h-5 w-5" />
                            </button>
                            <button className="rounded-full p-2 hover:bg-blue-500/10 transition-colors">
                                <Calendar className="h-5 w-5" />
                            </button>
                            <button className="rounded-full p-2 hover:bg-blue-500/10 transition-colors">
                                <MapPin className="h-5 w-5" />
                            </button>
                        </div>
                        <Button
                            onClick={handlePost}
                            disabled={!content.trim() || isPosting}
                            className="rounded-full bg-blue-500 px-6 font-bold text-white hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isPosting ? "Posting..." : "Post"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
