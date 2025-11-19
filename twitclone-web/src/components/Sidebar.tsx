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
import { MoreHorizontal } from "lucide-react";
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
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      <aside className="hidden h-screen border-r border-neutral-800 px-4 py-3 text-neutral-50 sm:flex sm:w-64 lg:w-72 overflow-hidden sticky top-0">
        <nav className="flex flex-col w-full h-full">
          <div className="mb-2 text-2xl font-bold px-3 py-2">Twitr</div>
          <ul className="flex flex-col gap-2 mt-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/home" && pathname?.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-5 rounded-full px-4 py-3 text-xl transition-colors ${isActive
                      ? "font-bold text-white"
                      : "font-normal text-neutral-50 hover:bg-neutral-900"
                      }`}
                  >
                    <span>
                      {isActive ? item.activeIcon : item.icon}
                    </span>
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 w-full bg-blue-500 text-white text-lg font-bold py-6 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
          >
            <span className="hidden md:inline">Post</span>
            <span className="md:hidden">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
              </svg>
            </span>
          </Button>

          {user && (
            <div className="mt-auto mb-4">
              <button className="flex items-center gap-3 w-full p-3 rounded-full hover:bg-neutral-900 transition-colors text-left group">
                <div className="h-10 w-10 rounded-full bg-neutral-700 overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500" />
                  )}
                </div>
                <div className="hidden md:block flex-1 min-w-0">
                  <div className="font-bold text-sm truncate text-white">
                    {user.name}
                  </div>
                  <div className="text-neutral-500 text-sm truncate">
                    @{user.username}
                  </div>
                </div>
                <div className="hidden md:block">
                  <MoreHorizontal className="h-5 w-5 text-neutral-500 group-hover:text-white transition-colors" />
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


