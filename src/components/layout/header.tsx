
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Shield, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
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
  { href: '/standings', label: 'Standings' },
  { href: '/teams', label: 'Teams' },
  { href: '/players', label: 'Players' },
  { href: '/matches', label: 'Matches' },
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
        'transition-all hover:text-accent text-sm font-bold uppercase tracking-widest',
        pathname === href ? 'text-accent' : 'text-foreground/70'
      )}
      onClick={() => setMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center" />
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container relative flex h-16 items-center">
          {/* Left Side */}
          <div className="flex items-center">
            {/* Mobile Menu */}
            <div className="md:hidden mr-2">
              <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-accent/10">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-background border-r-white/5">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                      Navigate the application pages.
                    </SheetDescription>
                  </SheetHeader>
                  <Link href="/" className="mr-6 flex items-center space-x-2 my-10" onClick={() => setMobileMenuOpen(false)}>
                    <Shield className="h-8 w-8 text-accent" />
                    <span className="font-black text-2xl tracking-tighter italic">DFPL</span>
                  </Link>
                  <nav className="flex flex-col space-y-6">
                    {navLinks.map(link => (
                      <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-accent rounded-lg p-1 transition-transform group-hover:rotate-12">
                  <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter italic hidden sm:inline-block">DFPL</span>
            </Link>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-8">
            {navLinks.map(link => (
              <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex flex-1 items-center justify-end space-x-3">
            <ThemeToggle />
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" asChild className="hidden sm:flex rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-bold">
                  <Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4 text-accent" />Admin</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setLogoutDialogOpen(true)} className="rounded-full hover:bg-accent/10 text-destructive hover:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" asChild className="rounded-full border-accent/30 bg-accent/5 text-accent hover:bg-accent hover:text-white font-bold transition-all">
                <Link href="/admin-auth"><LogIn className="mr-2 h-4 w-4" />Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tight">Terminate <span className="text-accent">Session?</span></AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to log out of the administrative command center?
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
