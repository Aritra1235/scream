import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { TweetModal } from '@/components/TweetModal';

export interface TweetMedia {
  mediaUrl: string;
  type: string;
  width: number | null;
  height: number | null;
  contentType: string;
}

export interface TweetAuthor {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  verified: boolean;
}

export interface TweetEngagement {
  likes: number;
  reposts: number;
  replies: number;
  liked_by_user: boolean;
}

export interface TweetData {
  id: string;
  content: string;
  createdAt: string;
  mediaCount: number;
  media?: TweetMedia[];
  author: TweetAuthor;
  engagement: TweetEngagement;
  parentId?: string | null;
  repostOf?: TweetData;
}

interface TweetProps extends TweetData {
  depth?: number;
  disableNavigation?: boolean;
  onReply?: () => void;
}

export function Tweet({
  id,
  content,
  createdAt,
  mediaCount,
  media,
  author,
  engagement,
  repostOf,
  depth = 0,
  disableNavigation = false,
  onReply,
}: TweetProps) {
  const router = useRouter();
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const [liked, setLiked] = useState(engagement.liked_by_user);
  const [likesCount, setLikesCount] = useState<number>(Number(engagement.likes) || 0);
  const [repostsCount, setRepostsCount] = useState<number>(Number(engagement.reposts) || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);

  const handleNavigate = () => {
    if (disableNavigation) return;
    router.push(`/post/${id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    const nextLiked = !liked;
    const delta = nextLiked ? 1 : -1;
    const originalLiked = liked;
    const originalCount = likesCount;

    setLiked(nextLiked);
    setLikesCount((prevCount) => prevCount + delta);
    setIsLiking(true);

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/like/${liked ? 'unlike' : 'like'}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: id }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
    } catch (error) {
      console.error('Error updating like status:', error);
      setLiked(originalLiked);
      setLikesCount(originalCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReply) {
      onReply();
      return;
    }
    handleNavigate();
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReposting) return;
    setShowRepostModal(true);
  };

  return (
    <article
      className={`border-b-4 border-border p-6 hover:bg-muted transition-colors cursor-pointer bg-card ${depth > 0 ? 'pl-8' : ''}`}
      onClick={handleNavigate}
    >
      <div className="flex gap-4">
        <a href={`/${author.username}`} className="flex-shrink-0" tabIndex={0} onClick={(e) => e.stopPropagation()}>
          <img
            src={author.avatar_url || '/default-avatar.png'}
            alt={`${author.display_name || author.username}'s avatar`}
            className="w-12 h-12 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] object-cover bg-muted"
          />
        </a>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <a href={`/${author.username}`} className="font-black text-foreground uppercase tracking-tight hover:underline decoration-2 underline-offset-2 truncate" tabIndex={0} onClick={(e) => e.stopPropagation()}>
              {author.display_name || author.username}
            </a>
            {author.verified && (
              <div className="bg-foreground text-background p-0.5 rounded-none border border-border">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <span className="text-muted-foreground font-bold text-sm">
              @{author.username}
            </span>
            <span className="text-foreground font-black text-sm">·</span>
            <span className="text-muted-foreground font-bold text-sm hover:underline decoration-2 underline-offset-2 uppercase">
              {timeAgo}
            </span>
          </div>

          <div className="text-foreground text-lg font-medium mb-4 whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </div>

          {repostOf && (
            <div className="mb-4 border-2 border-border bg-muted p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={repostOf.author.avatar_url || '/default-avatar.png'}
                  alt={`${repostOf.author.username} avatar`}
                  className="w-8 h-8 border border-border object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase">{repostOf.author.display_name || repostOf.author.username}</span>
                  <span className="text-xs text-muted-foreground">@{repostOf.author.username}</span>
                </div>
              </div>
              <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                {repostOf.content}
              </div>
              {repostOf.media && repostOf.media.length > 0 && (
                <div className="mt-3 max-h-64 overflow-hidden rounded-sm border border-border bg-card/40">
                  <div
                    className={`grid gap-1 ${repostOf.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                  >
                    {(repostOf.media ?? []).slice(0, 4).map((item, index) => {
                      const single = (repostOf.media ?? []).length === 1;
                      return (
                        <div
                          key={`${item.mediaUrl}-${index}`}
                          className={`w-full ${single ? "h-full" : "aspect-square"}`}
                        >
                          <img
                            src={item.mediaUrl}
                            alt="Repost media"
                            className={`w-full h-full object-contain bg-muted ${single ? "max-h-64" : "max-h-48"}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {media && media.length > 0 && (
            <div className="mb-4 border-2 border-border bg-muted overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <div
                className={`grid gap-1 ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
              >
                {media.slice(0, 4).map((item, index) => (
                  <div
                    key={`${item.mediaUrl}-${index}`}
                    className={media.length === 1 ? "w-full h-full" : "aspect-square w-full"}
                  >
                    <img
                      src={item.mediaUrl}
                      alt="Post media"
                      className={`w-full h-full object-cover ${media.length === 1 ? "max-h-[500px]" : ""}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!media || media.length === 0) && mediaCount > 0 && (
            <div className="mb-4 bg-muted border-2 border-border p-4 text-center font-bold text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              {mediaCount} MEDIA FILE{mediaCount > 1 ? "S" : ""} ATTACHED
            </div>
          )}

          <div className="flex items-center justify-between max-w-md mt-2">
            <button
              onClick={handleReply}
              className="flex items-center gap-2 text-foreground hover:text-blue-600 transition-colors group"
            >
              <div className="p-2 border-2 border-transparent group-hover:border-border group-hover:bg-blue-100 group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">{engagement.replies}</span>
            </button>

            <button
              onClick={handleRepost}
              className="flex items-center gap-2 text-foreground hover:text-green-600 transition-colors group"
              disabled={isReposting}
            >
              <div className="p-2 border-2 border-transparent group-hover:border-border group-hover:bg-green-100 group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all">
                <Repeat2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">{repostsCount}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors group ${liked ? 'text-[#FF6B6B]' : 'text-foreground hover:text-[#FF6B6B]'}`}
            >
              <div className={`p-2 border-2 border-transparent transition-all ${liked ? 'bg-[#FF6B6B] border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] text-black' : 'group-hover:border-border group-hover:bg-[#FF6B6B] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'}`}>
                <Heart className={`w-5 h-5 ${liked ? 'fill-black' : ''}`} />
              </div>
              <span className="font-bold text-sm">{likesCount}</span>
            </button>

            <button className="flex items-center gap-2 text-foreground hover:text-blue-600 transition-colors group" onClick={(e) => e.stopPropagation()}>
              <div className="p-2 border-2 border-transparent group-hover:border-border group-hover:bg-blue-100 group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all">
                <Share className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {showRepostModal && (
        <TweetModal
          open={showRepostModal}
          onOpenChange={(open) => {
            setShowRepostModal(open);
            setIsReposting(false);
          }}
          onTweetPosted={() => {
            setRepostsCount((prev) => prev + 1);
            setShowRepostModal(false);
          }}
          variant="repost"
          repostTarget={{
            id,
            content,
            author: {
              displayName: author.display_name,
              username: author.username || undefined,
              avatar: author.avatar_url || undefined,
            },
            media,
          }}
        />
      )}
    </article>
  );
}
