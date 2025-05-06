// src/app/admin-auth/page.tsx
'use client';
import AdminSignIn from '@/components/admin-sign-in';
import { ShieldAlert } from 'lucide-react';

export default function AdminAuthPage() {
  return (
    <div className="space-y-8">
      <section className="py-12">
        <h1 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary" />
          Admin Authentication
        </h1>
        <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow">
          <AdminSignIn />
        </div>
      </section>
    </div>
  );
}
