"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, ShieldAlert, ShieldCheck } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

const sanitizePrefix = (prefix?: string | null) => {
  if (!prefix) return "api/v1";
  return prefix.replace(/^\/+/, "").replace(/\/+$/, "") || "api/v1";
};

const normalizedBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";
const apiPrefix = sanitizePrefix(process.env.NEXT_PUBLIC_API_PREFIX);
const apiBase = normalizedBaseUrl
  ? `${normalizedBaseUrl}/${apiPrefix}`
  : `/api/${apiPrefix}`;

type ResetStatus =
  | "idle"
  | "verifying"
  | "ready"
  | "submitting"
  | "success"
  | "error"
  | "invalid";

const statusStyles: Record<
  ResetStatus,
  { label: string; accent: string; icon: ReactNode }
> = {
  idle: {
    label: "Waiting for a reset link",
    accent: "bg-muted/40 text-muted-foreground",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  verifying: {
    label: "Checking link",
    accent: "bg-blue-500/20 text-blue-300",
    icon: <Spinner className="h-5 w-5 text-blue-300" />,
  },
  ready: {
    label: "Link confirmed",
    accent: "bg-blue-500/20 text-blue-300",
    icon: <ShieldCheck className="h-5 w-5 text-blue-300" />,
  },
  submitting: {
    label: "Updating password",
    accent: "bg-blue-500/20 text-blue-300",
    icon: <Spinner className="h-5 w-5 text-blue-300" />,
  },
  success: {
    label: "Password updated",
    accent: "bg-emerald-500/20 text-emerald-300",
    icon: <ShieldCheck className="h-5 w-5 text-emerald-300" />,
  },
  error: {
    label: "Something went wrong",
    accent: "bg-rose-500/20 text-rose-300",
    icon: <ShieldAlert className="h-5 w-5 text-rose-300" />,
  },
  invalid: {
    label: "Link expired",
    accent: "bg-rose-500/20 text-rose-300",
    icon: <ShieldAlert className="h-5 w-5 text-rose-300" />,
  },
};

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromParams = searchParams.get("token") ?? "";
  const errorCode = searchParams.get("error");

  const [token, setToken] = useState(tokenFromParams);
  const [status, setStatus] = useState<ResetStatus>(() => {
    if (errorCode) return "invalid";
    return tokenFromParams ? "verifying" : "idle";
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    tokenFromParams
      ? "Checking your reset link..."
      : "Open the reset link from your email to continue.",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setToken(tokenFromParams);
  }, [tokenFromParams]);

  useEffect(() => {
    if (errorCode) {
      setStatus((prev) =>
        prev === "success" || prev === "submitting" ? prev : "invalid",
      );
      setStatusMessage(
        "This reset link is no longer valid. Request a fresh one.",
      );
      return;
    }

    if (!token) {
      setStatus((prev) =>
        prev === "success" || prev === "submitting" ? prev : "idle",
      );
      setStatusMessage("Open the reset link from your email to continue.");
      return;
    }

    let aborted = false;
    const controller = new AbortController();

    setStatus((prev) =>
      prev === "success" || prev === "submitting" ? prev : "verifying",
    );
    setStatusMessage("Checking your reset link...");

    const verifyToken = async () => {
      try {
        const response = await fetch(
          `${apiBase}/password/reset-token/${encodeURIComponent(token)}/verify`,
          {
            signal: controller.signal,
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Failed verification");
        }

        const result = await response.json();
        if (aborted) return;

        if (result.valid) {
          setStatus((prev) =>
            prev === "success" || prev === "submitting" ? prev : "ready",
          );
          setStatusMessage("Link confirmed. Set your new password below.");
        } else {
          setStatus((prev) =>
            prev === "success" || prev === "submitting" ? prev : "invalid",
          );
          setStatusMessage(
            "This reset link is no longer valid. Request a fresh one.",
          );
        }
      } catch (error) {
        if (aborted) return;
        setStatus((prev) =>
          prev === "success" || prev === "submitting" ? prev : "error",
        );
        setStatusMessage(
          "We couldn't verify your link. Refresh the page or request a new email.",
        );
      }
    };

    verifyToken();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [token, errorCode]);

  const requirements = useMemo(
    () => [
      `At least ${MIN_PASSWORD_LENGTH} characters`,
      "Use a mix of letters, numbers, and symbols",
      "Do not reuse passwords from other sites",
    ],
    [],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (!token) {
      setFormError("This reset link is missing a token. Request a new email.");
      setStatus("invalid");
      setStatusMessage(
        "We couldn't find a valid token. Request a new link below.",
      );
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setFormError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    setStatusMessage("Updating your password...");

    try {
      const result = await authClient.resetPassword({
        token,
        newPassword,
      });

      if (result.error) {
        setStatus("error");
        setFormError(
          result.error.message ||
            "We couldn't update your password. Try again.",
        );
        setStatusMessage(
          result.error.message ||
            "We couldn't update your password. Try again.",
        );
        return;
      }

      setStatus("success");
      setStatusMessage("Password updated. Redirecting you to sign in...");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (error) {
      console.warn("[ResetPassword] Failed to reset password", error);
      setStatus("error");
      setFormError("We couldn't update your password. Try again.");
      setStatusMessage("We couldn't update your password. Try again.");
    }
  };

  const canShowForm =
    status === "ready" || status === "submitting" || status === "success";

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row">
        <Card className="flex-1 border-border/40 bg-card/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-semibold text-foreground">
                  Reset your password
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Use the secure link from your email to finish the reset.
                </CardDescription>
              </div>
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${statusStyles[status].accent}`}
              >
                {statusStyles[status].icon}
                {statusStyles[status].label}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="rounded-2xl border border-border/50 bg-background/60 p-6 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-foreground">
                    {statusMessage}
                  </p>
                  {status !== "invalid" && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      The link works only once and expires quickly. If it fails,
                      request a fresh email.
                    </p>
                  )}
                </div>
              </div>
              {status === "invalid" && (
                <div className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  This link is invalid or expired. Request another reset email
                  to continue.
                </div>
              )}
              {status === "error" && formError && (
                <div className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {formError}
                </div>
              )}
              {status === "success" && (
                <div className="mt-6 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  Password updated successfully. Redirecting you to sign in...
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border/40 bg-background/40 p-6 shadow-sm">
              <p className="text-sm font-semibold text-foreground">
                Tips for a strong password
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {requirements.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="bg-border/60" />

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-accent"
                onClick={() => router.push("/forgot-password")}
              >
                Request a new link
              </Button>
              <p className="text-sm text-muted-foreground">
                Still stuck? Contact{" "}
                <span className="font-medium text-foreground">
                  support@scream.aritra.ovh
                </span>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="w-full max-w-lg space-y-6">
          {canShowForm ? (
            <Card className="border-border/40 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Choose a new password
                </CardTitle>
                <CardDescription>
                  Make sure it&rsquo;s unique to SCREAM.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-foreground">
                      New password
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a new password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        minLength={MIN_PASSWORD_LENGTH}
                        className="bg-background pr-12 text-foreground"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-foreground"
                    >
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        minLength={MIN_PASSWORD_LENGTH}
                        className="bg-background pr-12 text-foreground"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowConfirm((prev) => !prev)}
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4 text-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {formError && status !== "success" && (
                    <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {formError}
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg">
                    {status === "submitting" ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Securing your account...
                      </>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/40 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {status === "invalid" ? "Link expired" : "Hold on..."}
                </CardTitle>
                <CardDescription>
                  {status === "invalid"
                    ? "This secure link can no longer be used. Request another from the Forgot Password page."
                    : "We’re checking your reset link. This only takes a moment."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                  {status === "verifying" && <Spinner className="h-4 w-4" />}
                  {status === "invalid"
                    ? "Request a fresh link to continue."
                    : "Verifying that this link hasn't expired..."}
                </div>
                {status === "invalid" && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => router.push("/forgot-password")}
                  >
                    Request a new reset link
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {status === "success" && (
            <Card className="border border-border/40 bg-background/60">
              <CardContent className="py-4 text-sm text-muted-foreground">
                You&rsquo;re all set. We&rsquo;ll send you to the sign in page
                automatically, or{" "}
                <button
                  className="font-medium text-foreground underline"
                  onClick={() => router.push("/sign-in")}
                >
                  go now
                </button>
                .
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
