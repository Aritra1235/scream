"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SignIn from "@/components/auth/SignIn";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();

      if (session.data?.session) {
        router.push("/home");
      } else {
        setChecking(false); 
      }
    };

    checkAuth();
  }, [router]);

  const handleSuccess = () => {
    router.push("/onboarding");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSignUpClick = () => {
    router.push("/sign-up");
  };

  // 🔥 Show the loader while auth is being checked
  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <SignIn
          onSuccess={handleSuccess}
          onError={handleError}
          onSignUpClick={handleSignUpClick}
        />
      </div>
    </div>
  );
}
