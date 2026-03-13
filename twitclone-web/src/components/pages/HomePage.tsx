"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Feed } from "@/components/posts/Feed";
import { TweetInput } from "@/components/posts/TweetInput";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name?: string;
  email: string;
}

type FeedMode = "all" | "following";

export function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [feedMode, setFeedMode] = useState<FeedMode>("all");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/onboarding/${session.data.user.id}`,
            {
              credentials: "include",
            },
          );
          if (response.ok) {
            const onboardingData = await response.json();
            if (!onboardingData.onboarded) {
              router.push("/onboarding");
              return;
            }
          }
          setUser(session.data.user);
        } else {
          router.push("/sign-in");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/sign-in");
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col bg-card min-h-full">
      {/* Header with Feed Tabs */}
      <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b-4 border-border z-10">
        <h1 className="text-2xl font-black uppercase tracking-tight px-6 py-4">Home</h1>
        <div className="flex border-t-2 border-border">
          <button
            onClick={() => setFeedMode("all")}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-tight transition-colors relative ${
              feedMode === "all"
                ? "text-foreground"
                : "text-muted-foreground hover:bg-muted/30"
            }`}
          >
            For You
            {feedMode === "all" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#4ECDC4]" />
            )}
          </button>
          <button
            onClick={() => setFeedMode("following")}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-tight transition-colors relative ${
              feedMode === "following"
                ? "text-foreground"
                : "text-muted-foreground hover:bg-muted/30"
            }`}
          >
            Following
            {feedMode === "following" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#4ECDC4]" />
            )}
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1">
        <TweetInput />
        <Feed mode={feedMode} />
      </div>
    </div>
  );
}
