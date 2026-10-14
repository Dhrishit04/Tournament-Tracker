'use client';

import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  instruction?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function AccessDenied({
  title = "Access Denied",
  message = "Your current account does not have sufficient privileges to access this secure configuration zone.",
  instruction = "Contact System Admin to request access"
}: Readonly<AccessDeniedProps>) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 text-center">
      {/* a vermilion ring that keeps breathing outward */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: EASE }}
        className="relative grid h-24 w-24 place-items-center rounded-full border border-primary/50"
      >
        <span className="absolute inset-0 animate-ping rounded-full border border-primary/40 [animation-duration:2.4s]" />
        <ShieldAlert className="h-9 w-9 text-primary" strokeWidth={1.25} />
      </motion.div>

      <div className="space-y-4">
        <div className="k-eyebrow !mt-0">Restricted</div>
        <motion.h2
          initial={{ opacity: 0, y: 26, clipPath: 'inset(0 0 100% 0)' }}
          animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 -20% 0)' }}
          transition={{ duration: 1.05, ease: EASE, delay: 0.1 }}
          className="text-4xl font-normal uppercase leading-none tracking-[-.012em] md:text-5xl"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.25 }}
          className="mx-auto max-w-sm text-sm font-light leading-relaxed text-[#9aa5a0]"
        >
          {message}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="k-label rounded-full border border-[rgba(223,231,224,.13)] px-6 py-3 text-[hsl(var(--bone-dim))]"
      >
        {instruction}
      </motion.div>
    </div>
  );
}
