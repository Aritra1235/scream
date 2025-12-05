import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NeoButton } from "./NeoButton";

interface LandingNavProps {
  showBackLink?: boolean;
  showFeatures?: boolean;
  showAbout?: boolean;
}

export function LandingNav({
  showBackLink = false,
  showFeatures = false,
  showAbout = false,
}: LandingNavProps) {
  return (
    <nav className="bg-white border-b-4 border-black px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-black text-xl">
            T
          </div>
          <span className="text-2xl font-black uppercase tracking-tighter">
            SCREAM
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {showBackLink && (
            <Link
              href="/"
              className="flex items-center gap-2 font-bold hover:text-[#FF6B6B] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back Home
            </Link>
          )}
          {showFeatures && (
            <a
              href="#features"
              className="hidden md:inline-block hover:underline decoration-4 underline-offset-4 decoration-[#FF6B6B] font-bold"
            >
              Features
            </a>
          )}
          {showAbout && (
            <Link
              href="/about"
              className="hidden md:inline-block hover:underline decoration-4 underline-offset-4 decoration-[#4ECDC4] font-bold"
            >
              About
            </Link>
          )}
          <NeoButton href="/sign-up" variant="primary" className="py-2 px-6 text-base">
            Join Now
          </NeoButton>
        </div>
      </div>
    </nav>
  );
}


