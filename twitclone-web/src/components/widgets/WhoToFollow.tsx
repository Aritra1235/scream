"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FollowButton } from "@/components/user/FollowButton";

interface SuggestedUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  verified: boolean;
  followers_count: number;
  mutualCount: number;
}

export function WhoToFollow() {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/graph/suggestions?limit=3`,
          { credentials: "include" },
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error("Failed to load suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  if (isLoading || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="border-4 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-lg font-black uppercase tracking-tight px-4 py-3 border-b-2 border-border">
        Who to follow
      </h3>
      <div className="divide-y-2 divide-border">
        {suggestions.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <Link href={`/${user.username}`} className="shrink-0">
              <div className="w-10 h-10 border-2 border-border bg-muted overflow-hidden">
                {user.avatar_url ? (
                  <img
                    src={process.env.NEXT_PUBLIC_CDN_BASE_URL + "/" + user.avatar_url}
                    alt={user.display_name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#FFE66D]" />
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/${user.username}`}>
                <p className="font-bold text-sm truncate hover:underline">
                  {user.display_name || user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </p>
              </Link>
              {user.mutualCount > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.mutualCount} mutual{user.mutualCount > 1 ? "s" : ""}{" "}
                  follow
                </p>
              )}
            </div>
            <FollowButton targetUserId={user.id} initialFollowing={false} />
          </div>
        ))}
      </div>
      <Link
        href="/explore"
        className="block px-4 py-3 text-sm font-bold text-[#4ECDC4] hover:bg-muted/30 transition-colors border-t-2 border-border"
      >
        Show more
      </Link>
    </div>
  );
}
