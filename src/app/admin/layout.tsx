
'use client';

import { useAuth } from '@/hooks/use-auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessDenied } from '@/components/admin/access-denied';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-background pt-24">
        <div className="w-64 border-r border-white/5 p-8 space-y-6">
          <Skeleton className="h-10 w-3/4 rounded-xl opacity-20" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl opacity-10" />
            <Skeleton className="h-12 w-full rounded-xl opacity-10" />
            <Skeleton className="h-12 w-full rounded-xl opacity-10" />
            <Skeleton className="h-12 w-full rounded-xl opacity-10" />
          </div>
        </div>
        <div className="flex-1 p-10">
          <Skeleton className="h-12 w-1/3 mb-10 rounded-xl opacity-20" />
          <Skeleton className="h-64 w-full rounded-2xl opacity-10" />
        </div>
      </div>
    );
  }

  // If user is not an admin, we show the specialized Access Denied state instead of a redirect
  // This handles the "revoked/deleted account" scenario specifically
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen pt-24 bg-background relative overflow-hidden items-center justify-center p-6">
        <AccessDenied
          title="Identity Terminated"
          message="Your administrative account has been decommissioned or the session has expired. You no longer have access to the DFPL command center."
          instruction="Reach out to System Admin to request restoration"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen pt-24 bg-background relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 relative z-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
