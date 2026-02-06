
'use client';

import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  instruction?: string;
}

export function AccessDenied({ 
  title = "Access Denied", 
  message = "Your current account does not have sufficient privileges to access this secure configuration zone.",
  instruction = "Contact System Admin to request access"
}: AccessDeniedProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative p-8 bg-destructive/10 rounded-full border-2 border-destructive/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="h-20 w-20 text-destructive" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-5xl font-black font-headline tracking-tighter italic uppercase text-destructive leading-none">
          {title.split(' ')[0]} <span className="text-white">{title.split(' ').slice(1).join(' ')}</span>
        </h2>
        <p className="text-muted-foreground font-medium max-w-sm mx-auto text-sm leading-relaxed">
          {message}
        </p>
      </div>

      <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-accent shadow-xl backdrop-blur-sm">
        {instruction}
      </div>
    </motion.div>
  );
}
