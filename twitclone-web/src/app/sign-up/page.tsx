"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import SignUp from "@/components/auth/SignUp";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (session.data?.session) {
        if (session.data.user?.emailVerified) {
          router.push("/home");
          return;
        }
        const email = session.data.user?.email;
        const query = email ? `?email=${encodeURIComponent(email)}` : "";
        router.push(`/verify-email${query}`);
      } else {
        setChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Spinner className="size-6" />
      </div>
    );
  }

  const handleSuccess = (email: string) => {
    const query = new URLSearchParams();
    query.set("email", email);
    router.push(`/verify-email?${query.toString()}`);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSignInClick = () => {
    router.push("/sign-in");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}
        <SignUp
          onSuccess={handleSuccess}
          onError={handleError}
          onSignInClick={handleSignInClick}
        />
      </div>
    </div>
  );
}
