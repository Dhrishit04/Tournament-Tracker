// src/app/admin/page.tsx
'use client';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/firebase/AuthProvider'; // Import the useAuth hook
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const auth = getAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Redirect to home or login page after sign out
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="flex justify-center items-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </motion.div>
    );
  }

  if (!user) {
    // Redirect to the login page if the user is not authenticated
    // We do this in an effect to avoid server-side rendering issues with redirects
    if (typeof window !== 'undefined') {
      router.push('/admin-auth');
    }
    return null; // Render nothing while redirecting
  }

  return (
    <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
    >
      <motion.section className="py-12" variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          Admin Dashboard
        </h1>
        <motion.div 
            className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow"
            variants={itemVariants}
        >
          <p className="text-lg text-center">
            Welcome, {user.email}! This is where you can manage the tournament.
          </p>
          <div className="mt-6 text-center space-x-4">
            <Button asChild>
              <Link href="/admin/teams">Manage Teams</Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
