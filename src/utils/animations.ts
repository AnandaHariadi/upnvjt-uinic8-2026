import type { Variants, Transition } from "framer-motion";

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const pageTransition: Transition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

export const itemVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
};
