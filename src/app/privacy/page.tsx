'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex p-3 bg-accent/10 rounded-2xl text-accent mb-4">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h1 className="text-5xl font-black font-headline tracking-tighter italic uppercase">Privacy <span className="text-accent">Policy</span></h1>
        <p className="text-muted-foreground font-medium uppercase tracking-[0.3em] text-[10px]">Official DFPL Data Protection Protocol</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <Eye className="h-5 w-5 text-accent" /> Information Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>At Dongre Football Premier League (DFPL), we prioritize the security and integrity of tournament data. We collect information necessary to maintain the competitive environment:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Athlete Profiles:</strong> Names, ages, performance statistics, and profile visualizations registered by club administrators.</li>
              <li><strong>Administrative Data:</strong> Emails and encrypted credentials for authorized personnel to access the Command Center.</li>
              <li><strong>System Logs:</strong> Automated records of administrative actions to ensure accountability and auditability of the league's lifecycle.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <Lock className="h-5 w-5 text-accent" /> Data Security & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>Your data is secured through professional-grade infrastructure:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Infrastructure:</strong> We utilize Google Firebase for secure data persistence and real-time synchronization.</li>
              <li><strong>Authentication:</strong> All administrative access is gated via Firebase Auth, employing industry-standard encryption for credentials.</li>
              <li><strong>Integrity:</strong> Granular security rules are enforced at the database level to prevent unauthorized modification of tournament standings or athlete records.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <FileText className="h-5 w-5 text-accent" /> Information Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>Collected data is used exclusively for tournament operations:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generating real-time standings and performance leaderboards.</li>
              <li>Maintaining a historical archive of seasonal data.</li>
              <li>Broadcasting live match updates and announcements via the ecosystem ticker.</li>
              <li>Providing AI-driven scout reports for league analysis.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center pt-8 border-t border-white/5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Inquiries regarding data rights should be directed to:</p>
          <a href="mailto:dfplowners@gmail.com" className="text-accent font-black hover:underline tracking-tighter italic text-lg">dfplowners@gmail.com</a>
        </div>
      </motion.div>
    </div>
  );
}
