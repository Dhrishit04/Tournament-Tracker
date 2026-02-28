'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-16 pt-32 max-w-4xl space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex p-3 bg-accent/10 rounded-2xl text-accent mb-4">
          <Gavel className="h-10 w-10" />
        </div>
        <h1 className="text-5xl font-black font-headline tracking-tighter italic uppercase">Terms of <span className="text-accent">Service</span></h1>
        <p className="text-muted-foreground font-medium uppercase tracking-[0.3em] text-[10px]">DFPL Competitive Governance Protocol</p>
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
              <Scale className="h-5 w-5 text-accent" /> 1. Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-muted-foreground leading-relaxed">
            <p>By accessing the Dongre Football Premier League (DFPL) platform, you agree to comply with and be bound by these Terms of Service. This platform is provided as an official management suite for tournament tracking and athlete registration. Any unauthorized attempt to bypass security protocols or manipulate league data will result in immediate termination of access.</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent" /> 2. Administrative Authority
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-muted-foreground leading-relaxed space-y-4">
            <p>The System Administrator ("Root Authority") maintains final decision-making power over:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Roster eligibility and draft class assignments.</li>
              <li>Validation of match results and goal distributions.</li>
              <li>Season scoping and decommissioning of historical timelines.</li>
              <li>Granting or revoking access elevations for staff accounts via the Registry.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-accent" /> 3. Data Integrity & Conduct
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-muted-foreground leading-relaxed space-y-4">
            <p>Users and Administrators must adhere to the "Sportsmanship Protocol":</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All performance metrics recorded in the Match Protocol must reflect the official results observed on the field.</li>
              <li>Any "Bulk Ingestion" via Excel must be verified for accuracy prior to deployment.</li>
              <li>Administrators are responsible for all actions taken under their identity, as recorded by the System Audit Terminal.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <Gavel className="h-5 w-5 text-accent" /> 4. Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-muted-foreground leading-relaxed">
            <p>While DFPL strives for 100% data precision, the platform is provided "as is." DFPL shall not be liable for any discrepancies in player statistics, temporary downtime of the real-time broadcast engine, or decisions made based on the AI Season Scout reports. Tournament outcomes are determined on the field; the platform serves as the official record of those outcomes.</p>
          </CardContent>
        </Card>

        <div className="text-center pt-8 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Effective Date: January 1, 2024 • v1.2.0-STABLE</p>
        </div>
      </motion.div>
    </div>
  );
}
