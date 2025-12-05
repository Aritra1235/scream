"use client";

import Sidebar from "@/components/Sidebar";
import { Geist, Geist_Mono } from "next/font/google";
import { useRef, useEffect } from "react";
import { UserInitializer } from "@/components/user-initializer";
import { UserStoreDebug } from "@/components/user-store-debug";
import { useUserStore } from "@/store/user-store";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, needsEmailVerification } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (needsEmailVerification) {
      router.push("/verify-email");
      return;
    }
    if (!user) {
      router.push("/sign-in");
    }
  }, [isLoading, user, needsEmailVerification, router]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const sidebar = document.querySelector("aside");
      const rightSide = document.querySelector("[data-right-side]");

      if (
        (sidebar?.contains(target) || rightSide?.contains(target)) &&
        mainRef.current
      ) {
        e.preventDefault();
        mainRef.current.scrollTop += e.deltaY;
      }
    };

    const container = mainRef.current?.parentElement;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [isLoading]);

  return (
    <>
      <UserInitializer />
      {isLoading ? (
        <div
          className={`${geistSans.variable} ${geistMono.variable} flex h-screen w-full items-center justify-center bg-background text-foreground`}
        >
          <Spinner className="size-10" />
        </div>
      ) : !user ? null : (
        <div
          className={`${geistSans.variable} ${geistMono.variable} flex h-screen justify-center bg-background text-foreground overflow-hidden`}
        >
          <div className="flex w-full max-w-[1200px] overflow-hidden">
            <Sidebar />
            {process.env.NEXT_PUBLIC_NODE_ENV === "development" && (
              <UserStoreDebug />
            )}
            <main
              ref={mainRef}
              className="flex-1 border-x-4 border-border bg-card min-w-0 overflow-y-auto"
            >
              {children}
            </main>
            <div className="hidden xl:block w-72" data-right-side></div>
          </div>
        </div>
      )}
    </>
  );
}


