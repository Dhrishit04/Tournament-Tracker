'use client';

import { useSeason } from '@/contexts/season-context';
import { useAuth } from '@/hooks/use-auth';
import { ShieldAlert, LogIn } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { isSessionActive, loading: seasonLoading } = useSeason();
  const { isAdmin, loading: authLoading } = useAuth();
  const pathname = usePathname();

  // The login portal must always be accessible so admins can establish a session
  const isAuthRoute = pathname === '/admin-auth';
  // Legal documentation must remain accessible even if the app is offline
  const isExceptionRoute = pathname === '/privacy' || pathname === '/terms';

  if (seasonLoading || authLoading) return <>{children}</>;

  // If session is inactive and user is not an admin, block access to EVERYTHING except specified routes.
  // This ensures that even direct URL navigation results in the maintenance screen when the system is offline.
  if (!isSessionActive && !isAdmin && !isAuthRoute && !isExceptionRoute) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,87,34,0.05)_0%,transparent_70%)] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8 relative z-10"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative p-8 bg-accent/10 rounded-full border-2 border-accent/20 shadow-[0_0_50px_rgba(255,87,34,0.2)]">
              <ShieldAlert className="h-16 w-16 text-accent" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-black font-headline tracking-tighter italic uppercase leading-none">
              Network <span className="text-accent">Offline</span>
            </h1>
            <div className="h-1 w-12 bg-accent mx-auto rounded-full" />
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              The DFPL Ultimate platform is currently down for scheduled maintenance or tactical reconfiguration. 
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-accent shadow-xl backdrop-blur-sm inline-block">
                Please contact Admins for protocol information
            </div>
            
            <div className="flex flex-col gap-3">
                <Button asChild variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest gap-2">
                    <Link href="/admin-auth">
                        <LogIn className="h-4 w-4" /> Admin Login Portal
                    </Link>
                </Button>
                <div className="flex gap-4 justify-center">
                    <Link href="/privacy" className="text-[10px] uppercase font-bold text-muted-foreground hover:text-accent transition-colors">Privacy</Link>
                    <Link href="/terms" className="text-[10px] uppercase font-bold text-muted-foreground hover:text-accent transition-colors">Terms</Link>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
