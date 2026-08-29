"use client";

import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/utils/animations";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
