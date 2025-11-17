import Sidebar from "@/components/Sidebar";
import { Geist, Geist_Mono } from "next/font/google";

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
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} flex h-screen justify-center bg-black text-white overflow-hidden`}
    >
      <div className="flex w-full max-w-7xl overflow-hidden">
        <Sidebar />
        <main className="flex-1 border-x border-neutral-800 min-w-0 overflow-y-auto">
          {children}
        </main>
        <div className="hidden xl:block w-80 lg:w-96"></div>
      </div>
    </div>
  );
}

