"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface XPPopupProps {
  xp: number;
  trigger: number; // increment to trigger animation
}

export function XPPopup({ xp, trigger }: XPPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -24 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="pointer-events-none absolute -top-2 right-0 text-sm font-bold text-primary"
        >
          +{xp} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}
