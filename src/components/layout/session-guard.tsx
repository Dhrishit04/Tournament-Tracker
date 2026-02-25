
'use client';

import { useSeason } from '@/contexts/season-context';
import { useAuth } from '@/hooks/use-auth';
import { ShieldAlert } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { isSessionActive, loading: seasonLoading } = useSeason();
  const { isAdmin, loading: authLoading } = useAuth();
  const pathname = usePathname();

  // Always allow access to admin routes and the login page
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = pathname === '/admin-auth';

  if (seasonLoading || authLoading) return <>{children}</>;

  // If session is inactive and user is not an admin, block access except for login portal
  if (!isSessionActive && !isAdmin && !isAdminRoute && !isAuthRoute) {
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

          <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-accent shadow-xl backdrop-blur-sm inline-block">
            Please contact Admins for protocol information
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
