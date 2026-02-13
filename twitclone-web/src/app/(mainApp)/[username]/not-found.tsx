"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col bg-card min-h-full items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-black uppercase mb-4">404</h1>
        <p className="text-2xl font-bold mb-2">User Not Found</p>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn't find this user. They may have deleted their account
          or the username might be incorrect.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/home"
            className="px-6 py-3 bg-[#FFE66D] border-4 border-black text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffd93d] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
