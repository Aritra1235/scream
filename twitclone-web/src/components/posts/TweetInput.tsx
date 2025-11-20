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
                    <Textarea
                        placeholder="WHAT'S ON YOUR MIND?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[100px] w-full resize-none border-4 border-border bg-background p-4 text-xl font-bold placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus-visible:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-shadow rounded-none"
                    />
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2 text-foreground">
                            <button className="group border-2 border-transparent p-2 hover:border-border hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:translate-x-0.5 active:scale-95">
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
                            disabled={!content.trim() || isPosting}
                            className="rounded-none border-2 border-border bg-[#4ECDC4] px-8 py-6 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-[#45b8b0] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:disabled:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all uppercase"
                        >
                            {isPosting ? "SCREAMING..." : "SCREAM"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
