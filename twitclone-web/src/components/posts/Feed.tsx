import React, { useState, useEffect } from 'react';
import { Tweet } from './Tweet';
import { Spinner } from '@/components/ui/spinner';

interface FeedPost {
  id: string;
  content: string;
  createdAt: string;
  mediaCount: number;
  media?: {
    mediaUrl: string;
    type: string;
    width: number | null;
    height: number | null;
    contentType: string;
  }[];
  author: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    verified: boolean;
  };
  engagement: {
    likes: number;
    reposts: number;
    replies: number;
    liked_by_user: boolean;
  };
}

interface FeedResponse {
  posts: FeedPost[];
}

interface FeedProps {
  className?: string;
}

export function Feed({ className = '' }: FeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchFeed = async (currentOffset = 0, append = false) => {
    try {
      setError(null);
      if (!append) {
        setIsLoading(true);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/feed?limit=${limit}&offset=${currentOffset}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.status}`);
      }

      const data: FeedResponse = await response.json();
      data.posts.forEach(post => {
        if (post.author.avatar_url) {
          post.author.avatar_url = process.env.NEXT_PUBLIC_CDN_BASE_URL + "/" + post.author.avatar_url;
        }
        if (post.media && post.media.length > 0) {
          post.media = post.media.map((item) => ({
            ...item,
            mediaUrl: `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${item.mediaUrl}`,
          }));
        }
      });

      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setHasMore(data.posts.length === limit);
      setOffset(currentOffset + data.posts.length);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchFeed(offset, true);
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Spinner className="size-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your feed...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-muted-foreground mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="font-medium">Failed to load feed</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => fetchFeed()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-muted-foreground">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium mb-2">No posts yet</p>
          <p className="text-sm">Follow some users to see their posts in your feed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="divide-y-4 divide-black">
        {posts.map((post) => (
          <Tweet key={post.id} {...post} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="p-6 border-t-4 border-black">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-[#FFE66D] border-4 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffd93d] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none text-lg font-black uppercase transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner className="size-6" />
                LOADING...
              </div>
            ) : (
              'LOAD MORE SCREAMS'
            )}
          </button>
        </div>
      )}

      {/* Error state for load more */}
      {error && posts.length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            <p>Failed to load more posts</p>
            <button
              onClick={loadMore}
              className="mt-2 text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
