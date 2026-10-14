'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useSeason } from '@/contexts/season-context';

/* Chapter numbers are fixed per section so they read the same for every admin,
   whatever subset of sections their permissions show. */
const ALL_SECTIONS = [
  { href: '/admin', no: '01', label: 'Overview', alt: 'Dashboard' },
  { href: '/admin/players', no: '02', label: 'Players', alt: 'Registry' },
  { href: '/admin/teams', no: '03', label: 'Teams', alt: 'Clubs' },
  { href: '/admin/matches', no: '04', label: 'Fixtures', alt: 'Schedule' },
  { href: '/admin/settings', no: '05', label: 'Settings', alt: 'Season' },
  { href: '/admin/about', no: '06', label: 'About Us', alt: 'Committee' },
  { href: '/admin/config', no: '07', label: 'Admin Config', alt: 'Access' },
  { href: '/admin/logs', no: '08', label: 'System Logs', alt: 'Terminal' },
] as const;

export const sectionFor = (pathname: string) =>
  ALL_SECTIONS.find((s) => s.href === pathname) ??
  ALL_SECTIONS.filter((s) => s.href !== '/admin').find((s) => pathname.startsWith(s.href + '/'));

/* same permission rules the sidebar always used */
function useVisibleSections() {
  const { isSystemAdmin, user } = useAuth();
  const canAccessSettings = isSystemAdmin || user?.canAccessSettings;
  return ALL_SECTIONS.filter((s) => {
    if (s.href === '/admin/settings') return canAccessSettings;
    if (s.href === '/admin/about' || s.href === '/admin/config' || s.href === '/admin/logs') return isSystemAdmin;
    return true;
  });
}

/* an ECG trace drawn on a loop */
function Heartbeat() {
  return (
    <svg viewBox="0 0 120 24" className="h-5 w-full" aria-hidden>
      <path d="M0 12h38l4-7 5 15 5-19 5 17 3-6h60" fill="none" stroke="rgba(223,231,224,.12)" strokeWidth="1" />
      <path
        d="M0 12h38l4-7 5 15 5-19 5 17 3-6h60"
        fill="none"
        stroke="#e0231c"
        strokeWidth="1.2"
        strokeDasharray="40 200"
        style={{ animation: 'k-heartbeat 2.4s linear infinite' }}
      />
    </svg>
  );
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {now ? now.toLocaleTimeString('en-GB', { hour12: false }) : '--:--:--'}
    </span>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const sections = useVisibleSections();
  const { currentSeason } = useSeason();
  const active = sectionFor(pathname)?.href;

  return (
    <aside className="sticky top-[var(--nav-h)] hidden h-[calc(100vh-var(--nav-h))] w-64 shrink-0 flex-col border-r border-[rgba(223,231,224,.07)] px-7 pb-8 pt-6 md:flex">
      <div className="mb-10">
        <div className="k-eyebrow !mt-0">Command Center</div>
        <p className="mt-3 text-[22px] font-normal uppercase leading-none tracking-[-.012em]">Admin</p>
        <p className="k-label mt-2 text-muted-foreground">
          {currentSeason ? `${currentSeason.name} · ${currentSeason.year}` : '—'}
        </p>
      </div>

      <nav className="relative flex flex-col">
        {sections.map((s) => {
          const on = s.href === active;
          return (
            <Link key={s.href} href={s.href} className="group relative flex items-center gap-4 border-b border-[rgba(223,231,224,.05)] py-3.5">
              {on && (
                <motion.span
                  layoutId="k-admin-active"
                  className="absolute -left-7 top-0 h-full w-[2px] bg-primary shadow-[0_0_14px_hsl(var(--primary))]"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                />
              )}
              <span className={cn('text-[10px] tabular-nums tracking-[.16em] transition-colors duration-500', on ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')}>
                {s.no}
              </span>
              <span className={cn('k-link', on && '!text-foreground')}>
                <span>{s.label}</span><span className="alt">{s.alt}</span>
              </span>
              <span className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-[rgba(223,231,224,.3)] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[rgba(223,231,224,.07)] pt-5">
        <div className="k-label flex items-center justify-between text-muted-foreground">
          <span>System</span>
          <Clock />
        </div>
        <Heartbeat />
        <p className="k-label mt-1 text-[hsl(var(--bone-dim))]">Core online</p>
      </div>
    </aside>
  );
}

/* below md the sidebar is gone, so a scrolling strip takes over */
export function AdminMobileNav() {
  const pathname = usePathname();
  const sections = useVisibleSections();
  const active = sectionFor(pathname)?.href;

  return (
    <nav className="custom-scrollbar sticky top-[var(--nav-h)] z-30 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-[rgba(223,231,224,.07)] bg-[rgba(5,7,10,.82)] px-4 backdrop-blur-xl md:hidden">
      {sections.map((s) => {
        const on = s.href === active;
        return (
          <Link key={s.href} href={s.href} className={cn('relative shrink-0 px-3 py-3.5 text-[10px] font-medium uppercase tracking-[.2em]', on ? 'text-foreground' : 'text-muted-foreground')}>
            <span className={cn('mr-1.5', on && 'text-primary')}>{s.no}</span>{s.label}
            {on && (
              <motion.span layoutId="k-admin-active-m" className="absolute inset-x-3 bottom-0 h-px bg-primary" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
