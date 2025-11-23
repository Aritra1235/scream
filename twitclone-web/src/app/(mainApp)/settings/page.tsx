"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("[Settings] Failed to sign out", error);
    } finally {
      router.push("/sign-in");
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-black uppercase">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            Settings
          </h1>
          <p className="text-lg font-bold text-muted-foreground">
            Customize your experience
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-4 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-card">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-1">
                  Appearance
                </h2>
                <p className="text-sm font-bold text-muted-foreground">
                  Customize how SCREAM looks on your device
                </p>
              </div>

              <Separator className="bg-border h-[2px]" />

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border-2 border-border bg-background flex items-center justify-center">
                    {theme === "dark" ? (
                      <Moon className="h-6 w-6" />
                    ) : (
                      <Sun className="h-6 w-6" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="dark-mode"
                      className="text-lg font-black uppercase tracking-tight cursor-pointer"
                    >
                      Dark Mode
                    </Label>
                    <p className="text-sm font-bold text-muted-foreground">
                      {theme === "dark"
                        ? "Currently using dark theme"
                        : "Currently using light theme"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                  className="data-[state=checked]:bg-[#4ECDC4] data-[state=unchecked]:bg-neutral-300 border-2 border-border rounded-none h-8 w-14"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-4 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-card">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-1">
                    Account
                  </h2>
                  <p className="text-sm font-bold text-muted-foreground">
                    Manage your SCREAM account
                  </p>
                </div>
              </div>

              <Separator className="bg-border h-[2px]" />

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-tight">
                    Log out
                  </p>
                  <p className="text-xs font-bold text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="border-2 border-border rounded-none font-black uppercase tracking-tight"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-4 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-card">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-1">
                  About
                </h2>
                <p className="text-sm font-bold text-muted-foreground">
                  Information about SCREAM
                </p>
              </div>

              <Separator className="bg-border h-[2px]" />

              <div className="space-y-4 py-2">
                <div className="flex justify-between items-center">
                  <span className="font-black uppercase text-sm">Version</span>
                  <span className="font-bold text-muted-foreground">1.0.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-black uppercase text-sm">Platform</span>
                  <span className="font-bold text-muted-foreground">Web</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

