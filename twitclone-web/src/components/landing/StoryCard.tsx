"use client";

import { motion } from "framer-motion";

interface StoryCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  delay?: number;
}

export function StoryCard({ icon, title, content, delay = 0 }: StoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-[#4ECDC4] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {icon}
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tight">{title}</h3>
      </div>
      <p className="text-lg font-bold leading-relaxed">{content}</p>
    </motion.div>
  );
}


