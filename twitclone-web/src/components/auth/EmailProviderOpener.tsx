"use client";

import { ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EmailProviderOpenerProps {
  email: string;
  senderEmail?: string;
}

const getEmailProvider = (email: string) => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;

  if (domain.includes("gmail.com")) return "gmail";
  if (
    domain.includes("outlook.com") ||
    domain.includes("live.com") ||
    domain.includes("hotmail.com")
  )
    return "outlook";
  if (domain.includes("yahoo.com")) return "yahoo";
  return null;
};

const getProviderUrl = (provider: string | null, senderEmail: string) => {
  const encodedSender = encodeURIComponent(`from:${senderEmail}`);

  switch (provider) {
    case "gmail":
      return `https://mail.google.com/mail/u/0/#search/${encodedSender}`;
    case "outlook":
      return `https://outlook.live.com/mail/0/inbox?search=${encodedSender}`;
    case "yahoo":
      return `https://mail.yahoo.com/search?search=${encodedSender}`;
    default:
      return null;
  }
};

export default function EmailProviderOpener({
  email,
  senderEmail = "noreply@scream.aritra.ovh",
}: EmailProviderOpenerProps) {
  const provider = getEmailProvider(email);
  const providerUrl = getProviderUrl(provider, senderEmail);

  const handleOpenProvider = () => {
    if (providerUrl) {
      window.open(providerUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenGeneric = () => {
    window.open(`mailto:${email}`, "_blank");
  };

  const getProviderName = (provider: string | null) => {
    switch (provider) {
      case "gmail":
        return "Gmail";
      case "outlook":
        return "Outlook";
      case "yahoo":
        return "Yahoo Mail";
      default:
        return "Email Client";
    }
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Open your email
        </CardTitle>
        <CardDescription>
          Quickly access your inbox to find the verification email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {provider && providerUrl && (
          <Button
            onClick={handleOpenProvider}
            className="w-full"
            variant="default"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open {getProviderName(provider)}
          </Button>
        )}

        <Button
          onClick={handleOpenGeneric}
          className="w-full"
          variant="outline"
        >
          <Mail className="mr-2 h-4 w-4" />
          Open Email Client
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Look for emails from {senderEmail}
        </p>
      </CardContent>
    </Card>
  );
}
