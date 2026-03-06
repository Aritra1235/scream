import { Suspense } from "react";
import VerifyEmail from "@/components/auth/VerifyEmail";
import { Spinner } from "@/components/ui/spinner";

function VerifyEmailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmail />
    </Suspense>
  );
}
