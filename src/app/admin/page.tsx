'use client';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); 

  useEffect(() => {
    const checkAuth = async () => {
      const firebase = (window as any).firebase;
      if (firebase && firebase.auth().currentUser) {
        setIsAdmin(true);
      } else if (firebase) { 
        window.location.href = '/admin-auth';
      }
      if(!firebase) setTimeout(checkAuth, 200); else setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
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

  if (!isAdmin) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-screen space-y-4 text-center p-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
            <ShieldAlert className="w-16 h-16 text-destructive" />
        </motion.div>
        <motion.h1 className="text-3xl font-bold" variants={itemVariants}>Access Denied</motion.h1>
        <motion.p className="text-lg text-muted-foreground" variants={itemVariants}>
            You do not have permission to view this page.
        </motion.p>
        <motion.div variants={itemVariants}>
            <Button asChild>
            <Link href="/admin-auth">Go to Admin Login</Link>
            </Button>
        </motion.div>
      </motion.div>
    );
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
            Welcome, Admin! This is where you can manage the tournament.
          </p>
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => {
              const firebase = (window as any).firebase;
              if (firebase) {
                firebase.auth().signOut().then(() => {
                  window.location.href = '/';
                });
              }
            }}>
              Sign Out
            </Button>
          </div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
