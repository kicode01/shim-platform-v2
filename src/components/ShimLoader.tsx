"use client";

import { motion } from "framer-motion";

export default function ShimLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full w-full min-h-[60vh] gap-4">
      <motion.div
        className="w-8 h-8 border-[2px] border-zinc-200 border-t-zinc-900 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
      />
      <motion.p 
        className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
      >
        Loading
      </motion.p>
    </div>
  );
}
