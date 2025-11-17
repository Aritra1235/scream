"use client";

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

  return (
    <aside className="hidden h-screen border-r border-neutral-800 px-4 py-3 text-neutral-50 sm:flex sm:w-64 lg:w-72 overflow-hidden">
      <nav className="flex flex-col w-full">
        <div className="mb-2 text-2xl font-bold px-3 py-2">Twitr</div>
        <ul className="flex flex-col gap-10 mt-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/home" && pathname?.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-5 rounded-full px-4 py-3 text-xl transition-colors ${
                    isActive
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
      </nav>
    </aside>
  );
}


