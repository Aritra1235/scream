"use client";

import { motion } from "framer-motion";

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export function ValueCard({ icon, title, description, color }: ValueCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotate: -1 }}
      className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${color}`}
    >
      <div className="text-center">
        <div className="p-4 bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-fit mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight mb-3">
          {title}
        </h3>
        <p className="text-lg font-bold leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}


