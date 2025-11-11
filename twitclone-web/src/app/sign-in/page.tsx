"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SignIn from "@/components/auth/SignIn";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const handleSuccess = () => {
    router.push("/onboarding");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSignUpClick = () => {
    router.push("/sign-up");
  };

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