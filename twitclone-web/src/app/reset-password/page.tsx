import { Suspense } from "react";
import ResetPassword from "@/components/auth/ResetPassword";
import { Spinner } from "@/components/ui/spinner";

function ResetPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPassword />
    </Suspense>
  );
}

