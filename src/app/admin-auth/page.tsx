import { AdminSignInForm } from '@/components/auth/admin-sign-in-form';

export default function AdminAuthPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <AdminSignInForm />
    </div>
  );
}
