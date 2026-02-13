import Image from "next/image";
import Link from "next/link";
import { VITAP_LOGO_PATH } from "@/lib/constants";

export function LandingFooter() {
  return (
    <footer className="bg-black text-white py-12 px-6 border-t-4 border-black">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h4 className="text-2xl font-black uppercase mb-2">SCREAM</h4>
          <p className="font-mono text-sm text-gray-400">
            © 2025. Built with rage and coffee.
          </p>
        </div>
        <div className="flex gap-6">
          <Link
            href="/about"
            className="font-bold hover:text-[#FF6B6B] transition-colors"
          >
            ABOUT
          </Link>
          <Link
            href="/privacy"
            className="font-bold hover:text-[#4ECDC4] transition-colors"
          >
            PRIVACY
          </Link>
          <Link
            href="/terms"
            className="font-bold hover:text-[#FFE66D] transition-colors"
          >
            TERMS
          </Link>
          <Link
            href="/contact"
            className="font-bold hover:text-[#4ECDC4] transition-colors"
          >
            CONTACT
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 flex justify-center">
        <Image
          src={VITAP_LOGO_PATH}
          alt="VIT-AP Logo"
          width={150}
          height={50}
          className="object-contain"
        />
      </div>
    </footer>
  );
}
