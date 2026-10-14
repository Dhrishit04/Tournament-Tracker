'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, Scale, AlertTriangle, ShieldCheck, Users, Copyright, Sparkles, Power, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const EFFECTIVE_DATE = 'October 14, 2026';

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <Card className="glass-card border-white/5 overflow-hidden">
      <CardHeader className="bg-white/5 border-b border-white/5">
        <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <Icon className="h-5 w-5 text-accent" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 text-muted-foreground leading-relaxed space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

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
        <p className="text-muted-foreground font-medium uppercase tracking-[0.3em] text-[10px]">The rules for using the DFPL website</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        <Section icon={Scale} title="1. Acceptance of terms">
          <p>
            By using the Dongre Football Premier League (&quot;DFPL&quot;) website, you agree to these terms. The site is the
            league&apos;s official record of fixtures, results, standings, clubs and players. If you do not agree, please do
            not use the site.
          </p>
        </Section>

        <Section icon={Users} title="2. Using the site">
          <p>Anyone can view the site and download the season spreadsheet. When you do, please:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use league data for personal, non-commercial purposes, and credit DFPL when you share it.</li>
            <li>Treat player information with respect. Do not use it to harass, contact or profile players, many of whom are young people.</li>
            <li>Do not try to access the admin area without permission, get around security, or overload the site with automated requests.</li>
          </ul>
          <p>We may block access for anyone who breaks these rules.</p>
        </Section>

        <Section icon={ShieldCheck} title="3. Administrator accounts">
          <p>Admin accounts are created only by the league&apos;s system administrator, who has the final say over:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Player eligibility and draft class assignments.</li>
            <li>Confirming match results, goals, assists and cards.</li>
            <li>Creating, switching and closing seasons.</li>
            <li>Granting, changing or removing administrator access.</li>
          </ul>
          <p>Administrators must keep their sign-in details private and are responsible for every change made under their account. All changes are recorded in the activity log.</p>
        </Section>

        <Section icon={AlertTriangle} title="4. Accurate records">
          <ul className="list-disc pl-6 space-y-2">
            <li>Match events and statistics must reflect what officially happened on the pitch.</li>
            <li>Spreadsheet (bulk) uploads must be checked for accuracy before they are imported.</li>
            <li>If you spot a mistake in any record, email us and we will review it.</li>
          </ul>
        </Section>

        <Section icon={Copyright} title="5. Content and ownership">
          <p>
            Club names, logos and player photos belong to their respective clubs and people and are shown with their
            permission. Some background photography is used under the Unsplash licence. Please do not copy logos or photos
            from this site for other uses without the owner&apos;s permission.
          </p>
        </Section>

        <Section icon={Sparkles} title="6. AI scout reports">
          <p>
            Administrators can generate scout reports with Google&apos;s Gemini AI. These reports are automated commentary,
            may contain errors, and are not official league decisions.
          </p>
        </Section>

        <Section icon={Power} title="7. Availability">
          <p>
            We aim to keep the site running, but it may be unavailable at times, including when the league takes it offline
            for maintenance between sessions. Features and content may change without notice.
          </p>
        </Section>

        <Section icon={Gavel} title="8. Limitation of liability">
          <p>
            The site is provided &quot;as is&quot;. While we work to keep every record accurate, DFPL is not liable for errors
            in statistics, downtime, or decisions made using information from this site, including AI scout reports. Results
            are decided on the pitch; this site records them.
          </p>
        </Section>

        <Section icon={RefreshCw} title="9. Changes to these terms">
          <p>
            We may update these terms from time to time. The effective date below shows the latest version, and continuing
            to use the site means you accept the updated terms. Our <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a> explains
            how we handle personal information.
          </p>
        </Section>

        <div className="text-center pt-8 border-t border-white/5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Questions about these terms:</p>
          <a href="mailto:dfplowners@gmail.com" className="text-accent font-black hover:underline tracking-tighter italic text-lg">dfplowners@gmail.com</a>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </motion.div>
    </div>
  );
}
