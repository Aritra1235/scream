"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GoHome,
  GoHomeFill,
  GoSearch,
  GoBookmark,
  GoBookmarkFill,
} from "react-icons/go";
import { RiSettings4Fill, RiSettings4Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { TweetModal } from "@/components/TweetModal";
import { useUserStore } from "@/store/user-store";
import { MoreHorizontal, User, UserRound } from "lucide-react";
import { useEffect } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/home",
    icon: <GoHome className="h-6 w-6" />,
    activeIcon: <GoHomeFill className="h-6 w-6" />,
  },
  {
    label: "Explore",
    href: "/explore",
    icon: <GoSearch className="h-6 w-6" />,
    activeIcon: <GoSearch className="h-6 w-6" />,
  },
  {
    label: "Bookmarks",
    href: "/bookmarks",
    icon: <GoBookmark className="h-6 w-6" />,
    activeIcon: <GoBookmarkFill className="h-6 w-6" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <RiSettings4Line className="h-6 w-6" />,
    activeIcon: <RiSettings4Fill className="h-6 w-6" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUserStore();

  const items: NavItem[] = user?.username
    ? [
        ...navItems,
        {
          label: "Profile",
          href: `/${user.username}`,
          icon: <User className="h-6 w-6" />,
          activeIcon: <UserRound className="h-6 w-6" />,
        },
      ]
    : navItems;

  return (
    <>
      <aside className="hidden h-screen px-4 py-3 text-foreground sm:flex sm:w-64 lg:w-72 overflow-hidden sticky top-0">
        <nav className="flex flex-col w-full h-full">
          <div className="mb-2 text-3xl font-black px-3 py-2 uppercase tracking-tighter">SCREAM</div>
          <ul className="flex flex-col gap-4 mt-4">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/home" && pathname?.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-4 rounded-none border-2 border-transparent px-4 py-3 text-xl transition-all duration-200 ${isActive
                      ? "font-black bg-[#4ECDC4] border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-1 translate-x-1"
                      : "font-bold hover:bg-card hover:border-border hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:translate-x-1"
                      }`}
                  >
                    <span>
                      {isActive ? item.activeIcon : item.icon}
                    </span>
                    <span className="hidden md:inline uppercase tracking-tight">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 w-full bg-[#FF6B6B] text-black text-xl font-black py-8 rounded-none border-4 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-[#FF8787] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:translate-x-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
          >
            <span className="hidden md:inline uppercase">Scream</span>
            <span className="md:hidden">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
              </svg>
            </span>
          </Button>

          {user && (
            <div className="mt-auto mb-4">
              <button className="flex items-center gap-3 w-full p-3 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all text-left group">
                <div className="h-10 w-10 border-2 border-border bg-muted overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#FFE66D]" />
                  )}
                </div>
                <div className="hidden md:block flex-1 min-w-0">
                  <div className="font-black text-sm truncate text-foreground uppercase">
                    {user.display_name}
                  </div>
                  <div className="text-muted-foreground text-sm truncate font-bold">
                    @{user.username}
                  </div>
                </div>
                <div className="hidden md:block">
                  <MoreHorizontal className="h-5 w-5 text-foreground" />
                </div>
              </button>
            </div>
          )}
        </nav>
      </aside>

      <TweetModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}


