"use client";

import { motion } from "framer-motion";

export default function ShimLoader({ theme = "light" }: { theme?: "light" | "dark" }) {
  const isDark = theme === "dark";
  return (
    <div className={`flex-1 flex flex-col items-center justify-center h-full w-full min-h-[60vh] gap-4 ${isDark ? "bg-[#0a0a0a]" : ""}`}>
      <motion.div
        className={`w-8 h-8 border-[2px] rounded-full ${isDark ? "border-zinc-800 border-t-zinc-100" : "border-zinc-200 border-t-zinc-900"}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
      />
      <motion.p 
        className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
      >
        Loading
      </motion.p>
    </div>
  );
}
