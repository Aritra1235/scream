import { CalendarIcon } from 'lucide-react';

interface UserProfileProps {
  user: {
    id: string;
    username: string;
    display_name?: string;
    bio?: string;
    avatar_url: string;
    banner_url: string;
    verified: boolean;
    followers_count: number;
    following_count: number;
    posts_count: number;
    createdAt: string;
    name?: string;
  };
  canEdit?: boolean;
  onEdit?: () => void;
}

export function UserProfile({ user, canEdit, onEdit }: UserProfileProps) {
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <section className="border-b border-border">
      {/* Banner */}
      <div className="relative h-32 sm:h-48 w-full bg-muted overflow-hidden">
        {user.banner_url ? (
          <img
            src={user.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500" />
        )}
      </div>

      {/* Profile content */}
      <div className="px-4 pb-4">
        {/* Avatar overlapping banner and Action Button */}
        <div className="flex justify-between items-end -mt-[10%] sm:-mt-[15%] mb-3">
          <div className="relative rounded-full border-[4px] border-background bg-background">
            <img
              src={user.avatar_url || 'https://via.placeholder.com/128'}
              alt={user.display_name || user.username || 'User'}
              className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover bg-muted"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/128';
              }}
            />
          </div>
          <div className="pb-2">
            {canEdit && (
              <button
                className="rounded-full border border-border px-4 py-1.5 font-bold hover:bg-muted/50 transition-colors text-sm"
                onClick={onEdit}
              >
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1">
            <h2 className="text-xl sm:text-2xl font-bold leading-tight">
              {user.display_name || user.username}
            </h2>
            {user.verified && (
              <svg
                className="w-5 h-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="text-sm mb-3 whitespace-pre-wrap break-words leading-snug">
            {user.bio}
          </div>
        )}

        {/* Join Date */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <CalendarIcon className="w-4 h-4" />
          <span>Joined {joinDate}</span>
        </div>

        {/* Stats */}
        <div className="flex gap-5 text-sm">
          <div className="hover:underline cursor-pointer">
            <span className="font-bold text-foreground">{user.following_count}</span>{' '}
            <span className="text-muted-foreground">Following</span>
          </div>
          <div className="hover:underline cursor-pointer">
            <span className="font-bold text-foreground">{user.followers_count}</span>{' '}
            <span className="text-muted-foreground">Followers</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border">
        {['Posts', 'Replies', 'Highlights', 'Media', 'Likes'].map((tab, i) => (
          <button
            key={tab}
            className={`flex-1 hover:bg-muted/50 transition-colors px-4 py-3 text-sm font-medium relative ${
              i === 0 ? 'text-foreground font-bold' : 'text-muted-foreground'
            }`}
          >
            {tab}
            {i === 0 && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

