"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Tweet, type TweetData } from "@/components/posts/Tweet";
import { TweetInput } from "@/components/posts/TweetInput";

type ThreadPost = TweetData & {
    replies?: ThreadPost[];
    repostOf?: ThreadPost;
};

function normalizePost(post: ThreadPost): ThreadPost {
    const normalized: ThreadPost = {
        ...post,
        author: {
            ...post.author,
            avatar_url: post.author.avatar_url
                ? `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${post.author.avatar_url}`
                : post.author.avatar_url,
        },
        media: post.media?.map((item) => ({
            ...item,
            mediaUrl: `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${item.mediaUrl}`,
        })),
        engagement: {
            ...post.engagement,
            likes: Number(post.engagement.likes) || 0,
            reposts: Number(post.engagement.reposts) || 0,
            replies: Number(post.engagement.replies) || 0,
            liked_by_user: !!post.engagement.liked_by_user,
        },
    };

    if (post.repostOf) {
        normalized.repostOf = normalizePost(post.repostOf);
    }
    if (post.replies) {
        normalized.replies = post.replies.map(normalizePost);
    }
    return normalized;
}

export default function PostDetailPage() {
    const router = useRouter();
    const routeParams = useParams<{ id?: string }>();
    const postId = routeParams?.id;
    const [post, setPost] = useState<ThreadPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPost = useCallback(async () => {
        if (!postId) {
            setError("Post id missing");
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/post/id/${postId}`,
                {
                    credentials: "include",
                }
            );
            if (!response.ok) {
                if (response.status === 404) {
                    setError("Post not found");
                    return;
                }
                throw new Error("Failed to load post");
            }
            const data = await response.json();
            setPost(normalizePost(data.post));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load post");
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const renderReplies = useCallback(
        (items: ThreadPost[] | undefined, depth = 1): JSX.Element[] | null => {
            if (!items || items.length === 0) return null;
            return items.map((reply) => (
                <div key={reply.id} className="border-l-4 border-border">
                    <Tweet {...reply} depth={depth} disableNavigation />
                    {renderReplies(reply.replies, depth + 1)}
                </div>
            ));
        },
        []
    );

    const pageContent = useMemo(() => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Spinner className="size-8 mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading post...</p>
                    </div>
                </div>
            );
        }

        if (error || !post) {
            return (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                    <p className="text-2xl font-black mb-2">Post unavailable</p>
                    <p className="text-muted-foreground">{error || "Try again later."}</p>
                </div>
            );
        }

        return (
            <>
                <Tweet {...post} disableNavigation />
                <div className="border-b-4 border-border">
                    <TweetInput
                        variant="reply"
                        parentId={post.id}
                        autoRefresh={false}
                        onSuccess={() => fetchPost()}
                        placeholder="Reply to this post..."
                    />
                </div>
                <div>{renderReplies(post.replies)}</div>
            </>
        );
    }, [error, fetchPost, isLoading, post, renderReplies]);

    return (
        <div className="flex flex-col bg-card min-h-full">
            <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-sm border-b-4 border-border px-4 py-3 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="hover:bg-black/10 p-2 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                    <span className="text-lg font-black truncate">Post</span>
                    <span className="text-xs text-muted-foreground">Thread</span>
                </div>
            </div>
            {pageContent}
        </div>
    );
}

