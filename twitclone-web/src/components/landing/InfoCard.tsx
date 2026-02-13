"use client";

import { motion } from "framer-motion";

interface InfoCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  iconBgColor?: string;
}

export function InfoCard({
  title,
  description,
  children,
  icon,
  iconBgColor = "bg-[#4ECDC4]",
}: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`p-4 ${iconBgColor} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-1">
            {title}
          </h2>
          <p className="text-lg font-bold text-gray-600">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}
