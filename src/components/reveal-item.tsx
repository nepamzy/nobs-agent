"use client";

import { motion } from "framer-motion";

// A single fade-up-on-scroll wrapper, shared across list/grid pages
// (portfolio, case studies, testimonials, clients, FAQ, resources, blog)
// so cards animate in consistently without repeating the same
// framer-motion boilerplate in every page.
export function RevealItem({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.06 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
