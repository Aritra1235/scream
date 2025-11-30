'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { UserProfile } from '@/components/user/UserProfile';
import { UserFeed } from '@/components/user/UserFeed';
import { Spinner } from '@/components/ui/spinner';

interface User {
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
}

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/profile/${username}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found');
            return;
          }
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username]);

  if (isLoading) {
    return (
      <div className="flex flex-col bg-card min-h-full items-center justify-center">
        <div className="text-center">
          <Spinner className="size-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col bg-card min-h-full items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-5xl font-black uppercase mb-4">404</h1>
          <p className="text-2xl font-bold mb-2">User Not Found</p>
          <p className="text-muted-foreground mb-8">
            {error || 'Sorry, we could not find this user.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-card min-h-full">
      {/* Top bar like /home but for user */}
      <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-sm border-b-4 border-border px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="hover:bg-black/10 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <span className="text-lg font-black truncate">
            {user.display_name || user.username}
          </span>
          <span className="text-xs text-muted-foreground">
            {user.posts_count} posts
          </span>
        </div>
      </div>

      {/* Profile header */}
      <UserProfile user={user} />

      {/* Timeline */}
      <div className="flex-1">
        <UserFeed username={username} />
      </div>
    </div>
  );
}