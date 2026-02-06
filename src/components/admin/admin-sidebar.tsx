
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, Calendar, Settings, LayoutDashboard, UserCog, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSystemAdmin, user } = useAuth();

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/players', label: 'Players', icon: Users },
    { href: '/admin/teams', label: 'Teams', icon: Shield },
    { href: '/admin/matches', label: 'Fixtures', icon: Calendar },
  ];

  // Elevated permission check
  const canAccessSettings = isSystemAdmin || user?.canAccessSettings;

  // Restricted items logic
  const restrictedItems = [];
  if (canAccessSettings) {
    restrictedItems.push({ href: '/admin/settings', label: 'Settings', icon: Settings });
  }
  if (isSystemAdmin) {
    restrictedItems.push({ href: '/admin/config', label: 'Admin Config', icon: UserCog });
    restrictedItems.push({ href: '/admin/logs', label: 'System Logs', icon: History });
  }

  const visibleItems = [...navItems, ...restrictedItems];

  return (
    <aside className="w-64 border-r border-white/5 bg-secondary/10 backdrop-blur-xl p-6 hidden md:block">
      <div className="flex flex-col h-full">
        <div className="mb-10 px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-1">Command Center</p>
          <h2 className="text-xl font-black italic tracking-tighter">ADMIN <span className="text-accent">PANEL</span></h2>
        </div>
        
        <nav className="flex flex-col gap-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition-all duration-300 group',
                  isActive 
                    ? 'bg-accent/10 text-accent border border-accent/20 shadow-[0_0_15px_rgba(255,87,34,0.1)]' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-accent")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="rounded-2xl bg-gradient-to-br from-accent/20 to-transparent p-4 border border-accent/10">
            <p className="text-[10px] font-bold text-accent uppercase mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium">Core Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
