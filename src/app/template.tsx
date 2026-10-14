'use client';

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

/* Re-mounts on every route change. The landing runs its own intro and the
   admin shell has its own template, so both pass straight through. */
export default function RootTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (pathname === '/' || pathname.startsWith('/admin') || reduce) return <>{children}</>;

  return (
    <>
      {/* a vermilion rule sweeps under the nav, then fades */}
      <motion.span
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-[var(--nav-h)] z-40 h-px origin-left bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ scaleX: { duration: 0.9, ease: EASE }, opacity: { duration: 0.5, delay: 0.75 } }}
      />
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05, ease: EASE }}
      >
        {children}
      </motion.div>
    </>
  );
}
