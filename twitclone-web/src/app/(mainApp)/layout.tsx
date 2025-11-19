"use client";

import Sidebar from "@/components/Sidebar";
import { Geist, Geist_Mono } from "next/font/google";
import { useRef, useEffect } from "react";
import { UserInitializer } from "@/components/user-initializer";
import { UserStoreDebug } from "@/components/user-store-debug";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const sidebar = document.querySelector('aside');
      const rightSide = document.querySelector('[data-right-side]');

      if ((sidebar?.contains(target) || rightSide?.contains(target)) && mainRef.current) {
        e.preventDefault();
        mainRef.current.scrollTop += e.deltaY;
      }
    };

    const container = mainRef.current?.parentElement;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} flex h-screen justify-center bg-background text-foreground overflow-hidden`}
    >
      <div className="flex w-full max-w-7xl overflow-hidden">
        <Sidebar />
        <UserInitializer />
        {process.env.NEXT_PUBLIC_NODE_ENV === 'development' && (
          <>
            <UserStoreDebug />
            {console.log('NEXT_PUBLIC_NODE_ENV', process.env.NEXT_PUBLIC_NODE_ENV)}
          </>
        )}
        <main ref={mainRef} className="flex-1 border-x-4 border-border bg-card min-w-0 overflow-y-auto">
          {children}
        </main>
        <div className="hidden xl:block w-80 lg:w-96" data-right-side></div>
      </div>
    </div>
  );
}
