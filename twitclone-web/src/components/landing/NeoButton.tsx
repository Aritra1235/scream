import Link from "next/link";

interface NeoButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export function NeoButton({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  onClick,
}: NeoButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center px-8 py-4 font-black text-lg border-4 border-black transition-all duration-200 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none";
  const variants = {
    primary: "bg-[#FF6B6B] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    secondary: "bg-[#4ECDC4] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  };

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
