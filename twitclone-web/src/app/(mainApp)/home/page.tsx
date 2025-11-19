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

export default function HomePage() {
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
                            credentials: 'include'
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // This shouldn't render as we redirect, but just in case
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="max-w-2xl mx-auto w-full border-x border-border flex flex-col flex-1 overflow-hidden">
                    {/* Header */}
                    <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
                        <h1 className="text-xl font-bold">Home</h1>
                    </div>



                    {/* Feed */}
                    <div className="flex-1 overflow-y-auto">
                        <TweetInput />
                        <Feed />
                    </div>
                </div>
            </div>
        </div>
    );
}