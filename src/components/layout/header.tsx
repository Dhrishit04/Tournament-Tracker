'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Shield, LogIn, LogOut, LayoutDashboard, BarChart3, Trophy, GitBranch } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/standings', label: 'Standings', icon: BarChart3 },
  { href: '/stats', label: 'Stats', icon: Trophy },
  { href: '/brackets', label: 'Brackets', icon: GitBranch },
  { href: '/matches', label: 'Matches', icon: null },
  { href: '/teams', label: 'Teams', icon: null },
  { href: '/players', label: 'Players', icon: null },
];

export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { isAdmin, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogoutConfirm = async () => {
    await logout();
    setLogoutDialogOpen(false);
    router.push('/');
  };

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={cn(
        'transition-all hover:text-accent text-xs font-black uppercase tracking-[0.2em] relative py-2',
        pathname === href ? 'text-accent' : 'text-foreground/60'
      )}
      onClick={() => setMobileMenuOpen(false)}
    >
      {children}
      {pathname === href && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-in fade-in zoom-in-95 duration-300" />
      )}
    </Link>
  );

  if (!isMounted) {
    return (
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <header className="w-full max-w-6xl h-14 rounded-full border border-white/10 bg-background/40 backdrop-blur-md shadow-2xl">
          <div className="container flex h-full items-center" />
        </header>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <header className="w-full max-w-6xl rounded-full border border-white/10 bg-background/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto transition-all duration-300">
          <div className="container relative flex h-14 items-center justify-between px-6">

            {/* Logo and Mobile Menu Trigger Slot */}
            <div className="flex flex-1 items-center justify-start">
              <div className="lg:hidden mr-2">
                <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-accent/10">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="bg-background border-r-white/5 flex flex-col p-8">
                    <SheetHeader>
                      <SheetTitle className="sr-only">Menu</SheetTitle>
                      <SheetDescription className="sr-only">
                        Navigate the application pages.
                      </SheetDescription>
                    </SheetHeader>
                    <Link href="/" className="flex items-center space-x-2 mb-12" onClick={() => setMobileMenuOpen(false)}>
                      <Shield className="h-10 w-10 text-accent" />
                      <span className="font-black text-3xl tracking-tighter italic">DFPL</span>
                    </Link>
                    <nav className="flex flex-col space-y-8">
                      {navLinks.map(link => (
                        <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
              <Link href="/" className="flex items-center space-x-2 group shrink-0">
                <div className="bg-primary/20 rounded-full p-1.5 transition-transform group-hover:scale-105 duration-300 border border-primary/30">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-lg tracking-tight hidden sm:inline-block">DFPL</span>
              </Link>
            </div>

            {/* Centered Desktop Navigation - Using lg breakpoint to avoid tablet overlap */}
            <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-6">
              {navLinks.map(link => (
                <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
              ))}
            </nav>

            {/* Action Buttons Slot */}
            <div className="flex flex-1 items-center justify-end space-x-3">
              <ThemeToggle />
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" asChild className="hidden xl:flex rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-black italic uppercase tracking-tighter text-[10px]">
                    <Link href="/admin"><LayoutDashboard className="mr-2 h-3.5 w-3.5 text-accent" />Command Center</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setLogoutDialogOpen(true)} className="rounded-full hover:bg-destructive/10 text-destructive hover:text-destructive group px-4">
                    <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" asChild className="rounded-full border-accent/30 bg-accent/5 text-accent hover:bg-accent hover:text-white font-black italic uppercase tracking-tighter text-[10px] transition-all">
                  <Link href="/admin-auth"><LogIn className="mr-2 h-3.5 w-3.5" />Admin Portal</Link>
                </Button>
              )}
            </div>
          </div>
        </header>
      </div>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tight">Terminate <span className="text-accent">Session?</span></AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to log out of the DFPL administrative command center?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-card border-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} className="bg-destructive hover:bg-destructive/90">Confirm Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}