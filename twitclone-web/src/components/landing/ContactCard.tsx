"use client";

import { motion } from "framer-motion";

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  content: string;
  color: string;
}

export function ContactCard({
  icon,
  title,
  description,
  content,
  color,
}: ContactCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotate: -1 }}
      className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${color}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-1">
            {title}
          </h3>
          <p className="text-lg font-bold text-gray-600">{description}</p>
        </div>
      </div>
      <p className="text-lg font-bold leading-relaxed">{content}</p>
    </motion.div>
  );
}


