"use client";

import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  color,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotate: -1 }}
      className={`p-8 border-4 border-black ${color} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none`}
    >
      <div className="mb-6 p-4 bg-white border-4 border-black w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">
        {title}
      </h3>
      <p className="text-lg font-bold leading-relaxed">{description}</p>
    </motion.div>
  );
}
