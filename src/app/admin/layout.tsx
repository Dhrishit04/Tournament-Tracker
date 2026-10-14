'use client';

import { useAuth } from '@/hooks/use-auth';
import { AdminMobileNav, AdminSidebar } from '@/components/admin/kage-admin';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessDenied } from '@/components/admin/access-denied';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="k-admin flex min-h-screen w-full pt-[var(--nav-h)]">
        <div className="hidden w-64 space-y-5 border-r border-[rgba(223,231,224,.07)] px-7 pt-6 md:block">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-7 w-2/3" />
          <div className="space-y-4 pt-6">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        </div>
        <div className="flex-1 space-y-8 p-6 md:p-10">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // If user is not an admin, we show the specialized Access Denied state instead of a redirect
  // This handles the "revoked/deleted account" scenario specifically
  if (!isAdmin) {
    return (
      <div className="k-admin relative flex min-h-screen items-center justify-center overflow-hidden p-6 pt-[var(--nav-h)]">
        <AccessDenied
          title="Identity Terminated"
          message="Your administrative account has been decommissioned or the session has expired. You no longer have access to the DFPL command center."
          instruction="Reach out to System Admin to request restoration"
        />
      </div>
    );
  }

  return (
    <div className="k-admin relative flex min-h-screen pt-[var(--nav-h)]">
      <AdminSidebar />
      <div className="k-admin-main relative z-10 mx-auto min-w-0 max-w-7xl flex-1 px-4 pb-16 pt-0 md:px-10 md:pt-8">
        <AdminMobileNav />
        {children}
      </div>
    </div>
  );
}
