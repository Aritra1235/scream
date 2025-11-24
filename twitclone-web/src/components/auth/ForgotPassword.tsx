"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, Send, ShieldAlert, ShieldCheck } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import EmailProviderOpener from "./EmailProviderOpener";

type RequestStatus = "idle" | "sending" | "sent" | "error";

const statusStyles: Record<RequestStatus, { label: string; accent: string; icon: ReactNode }> = {
  idle: {
    label: "Ready to help",
    accent: "bg-muted/40 text-muted-foreground",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  sending: {
    label: "Sending reset link",
    accent: "bg-blue-500/20 text-blue-300",
    icon: <Spinner className="h-5 w-5 text-blue-300" />,
  },
  sent: {
    label: "Email sent",
    accent: "bg-emerald-500/20 text-emerald-300",
    icon: <MailCheck className="h-5 w-5 text-emerald-300" />,
  },
  error: {
    label: "Something went wrong",
    accent: "bg-rose-500/20 text-rose-300",
    icon: <ShieldAlert className="h-5 w-5 text-rose-300" />,
  },
};

const STEPS = [
  {
    title: "Enter your email",
    copy: "Use the email linked to your SCREAM account.",
  },
  {
    title: "Check your inbox",
    copy: "Look for “Reset your SCREAM password”.",
  },
  {
    title: "Follow the secure link",
    copy: "It opens this site and lets you pick a new password.",
  },
];

const normalizeBaseUrl = (value?: string | null) => {
  if (!value) return "";
  return value.replace(/\/+$/, "");
};

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [message, setMessage] = useState("");
  const [appOrigin, setAppOrigin] = useState(() => normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? ""));

  useEffect(() => {
    if (!appOrigin && typeof window !== "undefined") {
      setAppOrigin(normalizeBaseUrl(window.location.origin));
    }
  }, [appOrigin]);

  const redirectTarget = useMemo(() => {
    if (appOrigin) {
      return `${appOrigin}/reset-password`;
    }
    if (typeof window !== "undefined") {
      return `${normalizeBaseUrl(window.location.origin)}/reset-password`;
    }
    return "/reset-password";
  }, [appOrigin]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Enter the email associated with your account.");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: redirectTarget,
      });

      if (result.error) {
        setStatus("error");
        setMessage(result.error.message || "We couldn't send that email. Try again soon.");
        return;
      }

      setStatus("sent");
      setMessage(
        (result.data as { message?: string })?.message ||
          "If this email exists, you’ll get reset instructions shortly."
      );
    } catch (error) {
      console.warn("[ForgotPassword] Failed to request password reset", error);
      setStatus("error");
      setMessage("We couldn't send that email. Try again soon.");
    }
  };

  const canShowRequestForm = status === "idle" || status === "error";
  const statusDescription =
    status === "sending"
      ? "Hold tight while we queue up your secure link..."
      : "Reset instructions are on the way. Check your inbox (and spam) soon.";

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row">
        <Card className="flex-1 border-border/40 bg-card/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-semibold text-foreground">Forgot your password?</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  We&rsquo;ll send you a secure link to set up a new one.
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
                  <Send className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-foreground">
                    Enter your email below and we&rsquo;ll send you a password reset link.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For your security, the link expires quickly. Use the same device to avoid another verification step.
                  </p>
                </div>
              </div>
              {status === "error" && message && (
                <div className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{message}</div>
              )}
              {status === "sent" && message && (
                <div className="mt-6 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-border/40 bg-background/40 p-4 shadow-sm">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{step.copy}</p>
                </div>
              ))}
            </div>

            <Separator className="bg-border/60" />

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="border-border text-foreground hover:bg-accent" onClick={() => router.push("/sign-in")}>
                Back to sign in
              </Button>
              <p className="text-sm text-muted-foreground">
                Need extra help? Email <span className="font-medium text-foreground">support@scream.aritra.ovh</span>.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="w-full max-w-lg space-y-6">
          {canShowRequestForm ? (
            <Card className="border-border/40 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Request a reset link</CardTitle>
                <CardDescription>We&rsquo;ll email you instructions almost instantly.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="[email protected]"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="bg-background text-foreground"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Send reset link
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/40 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {status === "sent" ? "Link on the way" : "Hold on..."}
                </CardTitle>
                <CardDescription>{statusDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                  {status === "sending" && <Spinner className="h-4 w-4" />}
                  {statusDescription}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStatus("idle");
                    setMessage("");
                  }}
                >
                  Enter a different email
                </Button>
              </CardContent>
            </Card>
          )}

          {status === "sent" && (
            <div className="space-y-4">
              <EmailProviderOpener email={email} />
              <Card className="border border-border/40 bg-background/60">
                <CardContent className="py-4 text-sm text-muted-foreground">
                  Haven&rsquo;t received anything after a few minutes? Check spam, then request another link or contact support.
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

