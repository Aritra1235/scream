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

export function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          // Check if user has completed onboarding
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/onboarding/${session.data.user.id}`,
            {
              credentials: "include",
            }
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
      {/* Header */}
      <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b-4 border-border px-6 py-4 z-10">
        <h1 className="text-2xl font-black uppercase tracking-tight">Home</h1>
      </div>

      {/* Feed */}
      <div className="flex-1">
        <TweetInput />
        <Feed />
      </div>
    </div>
  );
}


