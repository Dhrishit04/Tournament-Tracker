'use client';

import { AdminSignInForm } from '@/components/auth/admin-sign-in-form';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

export default function AdminAuthPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [spotlightOpacity, setSpotlightOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={pageRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setSpotlightOpacity(1)}
      onMouseLeave={() => setSpotlightOpacity(0)}
      className="flex min-h-screen items-center justify-center pt-32 pb-12 px-4 relative overflow-hidden"
    >
      {/* Mouse-tracking spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: spotlightOpacity,
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.12), transparent 40%)`,
        }}
      />

      {/* Animated background orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none"
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Animated grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Card entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <AdminSignInForm />
      </motion.div>
    </div>
  );
}
