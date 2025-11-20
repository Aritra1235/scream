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
      console.log("session", session);
      if (session.data?.session) {
        router.push("/home");
      } else {
        setChecking(false);
      }
    };
    checkAuth();
  }, []); 

  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Spinner className="size-6" />
      </div>
    );
  }

  const handleSuccess = () => {
    router.push("/onboarding");
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
