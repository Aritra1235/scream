"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FollowButton } from "@/components/user/FollowButton";
import { Spinner } from "@/components/ui/spinner";

interface TrendingUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  verified: boolean;
  followers_count: number;
  following_count: number;
  score: number;
}

export function ExplorePage() {
  const [trending, setTrending] = useState<TrendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/graph/trending?limit=20`,
          { credentials: "include" },
        );
        if (res.ok) {
          const data = await res.json();
          setTrending(data.trending || []);
        }
      } catch (err) {
        console.error("Failed to fetch trending:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="flex flex-col bg-card min-h-full">
      <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b-4 border-border px-6 py-4 z-10">
        <h1 className="text-2xl font-black uppercase tracking-tight">
          Explore
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-8" />
        </div>
      ) : trending.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-bold mb-2">Nothing trending yet</p>
          <p className="text-sm">Check back later for trending users.</p>
        </div>
      ) : (
        <div>
          <div className="px-6 py-4 border-b-2 border-border">
            <h2 className="text-lg font-black uppercase">Trending Users</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Popular accounts powered by the social graph
            </p>
          </div>
          <div className="divide-y-2 divide-border">
            {trending.map((user) => (
              <div
                key={user.id}
                className="flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
              >
                <Link href={`/${user.username}`} className="shrink-0">
                  <div className="w-12 h-12 border-2 border-border bg-muted overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FFE66D]" />
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/${user.username}`}>
                      <span className="font-bold hover:underline">
                        {user.display_name || user.username}
                      </span>
                    </Link>
                    {user.verified && (
                      <svg
                        className="w-4 h-4 text-blue-500"
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
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="text-sm mt-1 line-clamp-2">{user.bio}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.followers_count} followers
                  </p>
                </div>
                <FollowButton targetUserId={user.id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
