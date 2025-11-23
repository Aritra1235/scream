"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MailCheck, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import EmailProviderOpener from "./EmailProviderOpener";

type VerificationStatus = "idle" | "verifying" | "success" | "error";
type ResendStatus = "idle" | "sending" | "sent" | "error";

const sanitizePrefix = (prefix?: string | null) => {
  if (!prefix) return "api/v1";
  return prefix.replace(/^\/+/, "").replace(/\/+$/, "");
};

const normalizedBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";
const apiPrefix = sanitizePrefix(process.env.NEXT_PUBLIC_API_PREFIX);
const apiBase = normalizedBaseUrl
  ? `${normalizedBaseUrl}/${apiPrefix}`
  : `/api/${apiPrefix}`;

const statusStyles: Record<VerificationStatus, { label: string; accent: string; icon: React.ReactNode }> = {
  idle: {
    label: "Waiting for verification",
    accent: "bg-amber-500/20 text-amber-400",
    icon: <ShieldCheck className="h-5 w-5 text-amber-300" />,
  },
  verifying: {
    label: "Confirming your link",
    accent: "bg-blue-500/20 text-blue-300",
    icon: <Spinner className="h-5 w-5 text-blue-300" />,
  },
  success: {
    label: "Email verified",
    accent: "bg-emerald-500/20 text-emerald-300",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-300" />,
  },
  error: {
    label: "Verification failed",
    accent: "bg-rose-500/20 text-rose-300",
    icon: <ShieldAlert className="h-5 w-5 text-rose-300" />,
  },
};

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailFromParams = searchParams.get("email") ?? "";

  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [statusMessage, setStatusMessage] = useState(
    token
      ? "Confirming your verification link..."
      : "We sent you a secure link. Open it on this device to continue."
  );
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [resendMessage, setResendMessage] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);

  const redirectToApp = useCallback(async () => {
    try {
      const response = await fetch(`${apiBase}/profile/me`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        router.replace(data.user?.onboarded ? "/home" : "/onboarding");
        return;
      }
    } catch (error) {
      console.warn("[VerifyEmail] Unable to fetch profile for redirect", error);
    }
    router.replace("/onboarding");
  }, [router]);

  useEffect(() => {
    let active = true;
    const hydrateSession = async () => {
      try {
        const session = await authClient.getSession();
        if (!active) return;
        if (session.data?.user?.email) {
          setSessionEmail(session.data.user.email);
        }
        if (session.data?.user?.emailVerified) {
          redirectToApp();
        }
      } catch (error) {
        console.warn("[VerifyEmail] Unable to fetch session", error);
      }
    };
    hydrateSession();
    return () => {
      active = false;
    };
  }, [emailFromParams, redirectToApp]);

  const handleTokenVerification = useCallback(
    async (verificationToken: string) => {
      setStatus("verifying");
      setStatusMessage("Confirming your verification link...");
      const result = await authClient.verifyEmail({
        query: { token: verificationToken },
      });

      if (result.error) {
        setStatus("error");
        setStatusMessage(result.error.message || "We could not confirm that link. Request a new email.");
        return;
      }

      setStatus("success");
      setStatusMessage("Your email is verified. Redirecting you to the app...");

      try {
        await authClient.getSession();
      } catch (error) {
        console.warn("[VerifyEmail] Unable to refresh session after verification", error);
      }

      setTimeout(() => {
        redirectToApp();
      }, 1500);
    },
    [redirectToApp]
  );

  useEffect(() => {
    if (!token || hasAttemptedVerification) {
      return;
    }
    setHasAttemptedVerification(true);
    handleTokenVerification(token);
  }, [token, hasAttemptedVerification, handleTokenVerification]);

  const handleResend = async () => {
    if (!displayedEmail || !isValidEmail(displayedEmail)) {
      setResendStatus("error");
      setResendMessage("No valid email address found.");
      return;
    }

    setResendStatus("sending");
    setResendMessage("");
    const result = await authClient.sendVerificationEmail({
      email: displayedEmail,
      callbackURL: "/verify-email",
    });

    if (result.error) {
      setResendStatus("error");
      setResendMessage(result.error.message || "Unable to send email right now. Try again soon.");
      return;
    }

    setResendStatus("sent");
    setResendMessage("Verification email sent. Check your inbox (and spam folder).");
  };

  const displayedEmail = useMemo(() => {
    if (sessionEmail) return sessionEmail;
    if (emailFromParams) return emailFromParams;
    return "your email address";
  }, [sessionEmail, emailFromParams]);

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row">
        <Card className="flex-1 border-border/40 bg-card/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-semibold text-foreground">Verify your email</CardTitle>

              </div>
              <div className={`rounded-full px-4 py-2 text-sm font-medium ${statusStyles[status].accent} flex items-center gap-2`}>
                {statusStyles[status].icon}
                {statusStyles[status].label}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="rounded-2xl border border-border/50 bg-background/60 p-6 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <MailCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-foreground">{statusMessage}</p>

                </div>
              </div>
              {status === "verifying" && (
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  <Spinner className="h-4 w-4" />
                  Hang tight, we&rsquo;re confirming your link...
                </div>
              )}
              {status === "error" && (
                <div className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  The link might be expired or already used. Request a fresh email below.
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {["Check your inbox", "Tap the secure link", "Get instant access"].map((title, index) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/40 bg-background/40 p-4 text-center shadow-sm"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {index === 0 && "Look for \"Verify your SCREAM account\"."}
                    {index === 1 && "The link opens this page and confirms automatically."}
                    {index === 2 && "We redirect you to finish onboarding or jump back into SCREAM."}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="bg-border/60" />

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="border-border text-foreground hover:bg-accent" onClick={() => router.push("/sign-in")}>
                Return to sign in
              </Button>
              <div className="flex-1 flex justify-center">
                <Link
                  href="/support"
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  Need help? Contact support
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full max-w-lg space-y-6">
          <Card className="border-border/40 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Didn&rsquo;t get the email?</CardTitle>
              <CardDescription>Resend the verification email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resendMessage && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    resendStatus === "sent"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : resendStatus === "error"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {resendMessage}
                </div>
              )}
              <Button
                onClick={handleResend}
                className="w-full"
                disabled={resendStatus === "sending" || !displayedEmail}
              >
                {resendStatus === "sending" ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Sending email...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Send verification email
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Tip: Add <span className="font-medium text-foreground">noreply@scream.aritra.ovh</span> to your contacts to avoid spam filters.
              </p>
            </CardContent>
          </Card>

          <EmailProviderOpener email={displayedEmail} />

        </div>
      </div>
    </div>
  );
}

