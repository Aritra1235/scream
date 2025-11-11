"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function HomePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

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
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-card rounded-lg border p-8 shadow-sm">
                    <h1 className="text-3xl font-bold mb-4">Welcome to TwitClone, {user.name || user.email}!</h1>
                    <p className="text-muted-foreground mb-6">
                        This is your home feed. Your personalized Twitter-like experience starts here.
                    </p>
                    <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h2 className="font-semibold mb-2">What's next?</h2>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                <li>View your timeline</li>
                                <li>Post your first tweet</li>
                                <li>Follow other users</li>
                                <li>Explore trending topics</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}