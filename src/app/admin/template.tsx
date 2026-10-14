'use client';

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { sectionFor } from '@/components/admin/kage-admin';

const EASE = [0.16, 1, 0.3, 1] as const;

/* Re-mounts on every admin route change: a hairline draws across, the
   chapter eyebrow fades in, and the page rises in behind it. */
export default function AdminTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
  const section = sectionFor(usePathname());
  const reduce = useReducedMotion();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <motion.span
          className="k-label shrink-0 text-muted-foreground"
          initial={reduce ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <b className="font-medium text-primary">{section?.no ?? '—'}</b> — Command Center / {section?.label ?? 'Admin'}
        </motion.span>
        <motion.span
          className="h-px flex-1 origin-left bg-[rgba(223,231,224,.12)]"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.05 }}
        />
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05, ease: EASE, delay: 0.08 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
