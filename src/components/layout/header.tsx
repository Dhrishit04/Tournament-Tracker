'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// label rolls over to its alternate on hover, as in the template nav
const navLinks = [
  { href: '/standings', label: 'Standings', alt: 'Table' },
  { href: '/matches', label: 'Matches', alt: 'Fixtures' },
  { href: '/teams', label: 'Teams', alt: 'Clubs' },
  { href: '/players', label: 'Players', alt: 'Squads' },
  { href: '/stats', label: 'Stats', alt: 'Leaders' },
  { href: '/brackets', label: 'Brackets', alt: 'Knockouts' },
];

export function BrandMark({ className }: { className?: string }) {
  return (
    // club crest: hairline shield around a vermilion ball (centre panel + seams)
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true" className={className}>
      <path d="M22 4.5 36 9.2v12.3c0 9.1-5.8 15.4-14 18.3-8.2-2.9-14-9.2-14-18.3V9.2Z" stroke="#dfe7e0" strokeWidth="1.4" />
      <circle cx="22" cy="22" r="8.4" fill="#e0231c" />
      <path d="m22 18.3 3.2 2.35-1.2 3.8h-4l-1.2-3.8Z" fill="#05070a" />
      <path d="M22 18.3v-4.7M25.2 20.65l4.8-1.25M24 24.45l2.9 4.35M20 24.45l-2.9 4.35M18.8 20.65 14 19.4" stroke="#05070a" strokeWidth="1" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setStuck(y > 40);
      setHidden(y > last + 4 && y > window.innerHeight * 0.8);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // the landing page is the temple document, which carries its own nav
  if (pathname === '/') return null;

  const handleLogout = async () => {
    await logout();
    setLogoutDialogOpen(false);
    router.push('/');
  };

  const isOn = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <header className={cn('k-nav', stuck && 'stuck', hidden && !mobileMenuOpen && 'hide')}>
        <Link href="/" className="k-brand" aria-label="DFPL home">
          <BrandMark />
          <span className="k-brand-tx"><b>DFPL</b><i>DONGRE FOOTBALL PREMIER LEAGUE</i></span>
        </Link>

        <nav className="ml-auto hidden gap-[clamp(18px,2.2vw,40px)] lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn('k-link', isOn(link.href) && 'on')}>
              <span>{link.label}</span><span className="alt">{link.alt}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-[clamp(18px,2.6vw,42px)]">
          {isAdmin ? (
            <>
              <Link href="/admin" className="k-cta hidden sm:inline-flex"><span>Admin</span></Link>
              <button type="button" onClick={() => setLogoutDialogOpen(true)} className="k-link hidden sm:block"><span>Log out</span><span className="alt">Leave</span></button>
            </>
          ) : (
            <Link href="/admin-auth" className="k-cta hidden sm:inline-flex"><span>Admin portal</span></Link>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button type="button" className={cn('k-burger ml-2 lg:hidden', mobileMenuOpen && 'active')} aria-label="Menu"><i /><i /></button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(84vw,360px)] border-l border-[rgba(223,231,224,.07)] bg-[rgba(3,6,9,.98)] px-[var(--pad)] pt-[calc(var(--nav-h)+28px)]">
              <SheetHeader className="sr-only"><SheetTitle>Navigate</SheetTitle><SheetDescription>Explore the tournament record.</SheetDescription></SheetHeader>
              <nav className="flex flex-col">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                    className={cn('border-b border-[rgba(223,231,224,.07)] py-[17px] text-[17px] font-medium uppercase leading-tight tracking-[.2em] text-[hsl(var(--bone-dim))]', isOn(link.href) && 'text-foreground')}>
                    {link.label}
                    <span className="k-label mt-1.5 block text-muted-foreground">{link.alt}</span>
                  </Link>
                ))}
              </nav>
              <div className="mt-8">
                {isAdmin ? (
                  <div className="flex gap-3">
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="k-cta"><span>Admin</span></Link>
                    <button type="button" onClick={() => setLogoutDialogOpen(true)} className="k-cta"><span>Log out</span></button>
                  </div>
                ) : <Link href="/admin-auth" onClick={() => setMobileMenuOpen(false)} className="k-cta"><span>Admin portal</span></Link>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Log out of the admin portal?</AlertDialogTitle><AlertDialogDescription>Your current admin session will end on this device.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleLogout}>Log out</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
