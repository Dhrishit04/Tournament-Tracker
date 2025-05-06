'use client';
import AdminSignIn from '@/components/admin-sign-in';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.2 } },
};


export default function AdminAuthPage() {
  return (
    <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
    >
      <section className="py-12">
        <motion.h1 
            className="text-3xl font-bold mb-6 flex items-center justify-center gap-3"
            variants={containerVariants} // Use item variant for the heading
        >
          <ShieldAlert className="w-8 h-8 text-primary" />
          Admin Authentication
        </motion.h1>
        <motion.div 
            className="max-w-md mx-auto p-6 bg-card rounded-lg shadow"
            variants={cardVariants}
        >
          <AdminSignIn />
        </motion.div>
      </section>
    </motion.div>
  );
}
