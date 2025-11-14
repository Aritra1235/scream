import React from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TweetProps {
  id: string;
  content: string;
  createdAt: string;
  mediaCount: number;
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
  };
}

export function Tweet({ id, content, createdAt, mediaCount, author, engagement }: TweetProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <article className="border-b border-border p-4 hover:bg-muted/30 transition-colors cursor-pointer">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={author.avatar_url || '/default-avatar.png'}
            alt={`${author.display_name || author.username}'s avatar`}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>

        {/* Tweet Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground hover:underline truncate">
              {author.display_name || author.username}
            </span>
            {author.verified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-muted-foreground text-sm">
              @{author.username}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm hover:underline">
              {timeAgo}
            </span>
          </div>

          {/* Content */}
          <div className="text-foreground mb-3 whitespace-pre-wrap break-words">
            {content}
          </div>

          {/* Media placeholder - will be implemented when media fetching is added */}
          {mediaCount > 0 && (
            <div className="mb-3 bg-muted rounded-lg p-4 text-center text-muted-foreground">
              {mediaCount} media file{mediaCount > 1 ? 's' : ''} attached
            </div>
          )}

          {/* Engagement Actions */}
          <div className="flex items-center justify-between max-w-md mt-3">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-sm">{engagement.replies}</span>
            </button>

            <button className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 className="w-4 h-4" />
              </div>
              <span className="text-sm">{engagement.reposts}</span>
            </button>

            <button className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-sm">{engagement.likes}</span>
            </button>

            <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <Share className="w-4 h-4" />
              </div>
            </button>

            <button className="flex items-center gap-2 text-muted-foreground hover:text-muted-foreground transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-muted transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
