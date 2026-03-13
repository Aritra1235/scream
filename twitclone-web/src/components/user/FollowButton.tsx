"use client";

import { useState, useEffect } from "react";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  targetUserId,
  initialFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing ?? false);
  const [isLoading, setIsLoading] = useState(
    !initialFollowing && initialFollowing === undefined,
  );
  const [isHovering, setIsHovering] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const prefix = process.env.NEXT_PUBLIC_API_PREFIX;

  useEffect(() => {
    if (initialFollowing !== undefined) {
      setIsFollowing(initialFollowing);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/${prefix}/follow/status/${targetUserId}`,
          { credentials: "include" },
        );
        if (res.ok) {
          const data = await res.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (err) {
        console.error("Failed to check follow status:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, [targetUserId, initialFollowing, baseUrl, prefix]);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      const res = await fetch(`${baseUrl}/${prefix}/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.ok) {
        const newState = !isFollowing;
        setIsFollowing(newState);
        onFollowChange?.(newState);
      }
    } catch (err) {
      console.error("Follow action failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="rounded-none border-2 border-border px-5 py-1.5 font-bold text-sm bg-muted text-muted-foreground"
      >
        ...
      </button>
    );
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`rounded-none border-2 border-border px-5 py-1.5 font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 ${
          isHovering
            ? "bg-red-500 text-white border-red-700"
            : "bg-[#4ECDC4] text-black"
        }`}
      >
        {isHovering ? "Unfollow" : "Following"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-none border-2 border-border px-5 py-1.5 font-bold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
    >
      Follow
    </button>
  );
}
