'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Lock, Eye, FileText, Globe, Cookie, Users, Clock, UserCheck, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const LAST_UPDATED = 'October 14, 2026';

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <Card className="glass-card border-white/5 overflow-hidden">
      <CardHeader className="bg-white/5 border-b border-white/5">
        <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <Icon className="h-5 w-5 text-accent" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 pt-32 max-w-4xl space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex p-3 bg-accent/10 rounded-2xl text-accent mb-4">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h1 className="text-5xl font-black font-headline tracking-tighter italic uppercase">Privacy <span className="text-accent">Policy</span></h1>
        <p className="text-muted-foreground font-medium uppercase tracking-[0.3em] text-[10px]">How DFPL collects, uses and protects information</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        <p className="text-muted-foreground leading-relaxed">
          This policy explains what the Dongre Football Premier League (&quot;DFPL&quot;, &quot;we&quot;) records on this website, what is
          shown to the public, which outside services are involved, and how you can ask us to correct or remove
          information about you.
        </p>

        <Section icon={Eye} title="Information we collect">
          <p>League administrators enter the information below. Visitors do not need an account, and we do not ask visitors for any personal details.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Player profiles:</strong> name, age, photo, club, playing positions, preferred foot, draft class, and match statistics such as appearances, goals, assists and cards.</li>
            <li><strong>Clubs:</strong> club names, logos and the names of club owners.</li>
            <li><strong>Committee members:</strong> for the About page, names, photos, short descriptions and links to social profiles, published with each member&apos;s agreement.</li>
            <li><strong>Administrator accounts:</strong> email address and role. Passwords are handled by Google Firebase Authentication; we never see or store them in readable form.</li>
            <li><strong>Activity logs:</strong> a record of each administrative change, including the action, the time and which administrator made it.</li>
            <li><strong>Visitor counts:</strong> an anonymous count of daily and all-time visits. We do not record names, IP addresses or browsing history for this.</li>
          </ul>
        </Section>

        <Section icon={Users} title="What is public">
          <p>DFPL is a public league record, so most of the information above is visible to anyone who visits the site:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Player profiles, club details, fixtures, results, standings and statistics.</li>
            <li>The committee members shown on the About page.</li>
            <li>The full season record, including player names and ages, can be downloaded by anyone as a spreadsheet from the home page.</li>
          </ul>
          <p>Administrator emails and activity logs are never shown publicly.</p>
        </Section>

        <Section icon={FileText} title="How we use information">
          <p>We use this information only to run the league and this website:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Showing live standings, fixtures, results and leaderboards.</li>
            <li>Keeping an archive of past seasons.</li>
            <li>Showing announcements in the site ticker.</li>
            <li>Producing optional AI scout reports for administrators (see below).</li>
            <li>Keeping administrators accountable for the changes they make.</li>
          </ul>
          <p>We do not sell information, show advertising or use your information for marketing.</p>
        </Section>

        <Section icon={Globe} title="Services we rely on">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Google Firebase:</strong> stores the league database and uploaded photos, and handles administrator sign-in.</li>
            <li><strong>Google Gemini:</strong> when an administrator requests an AI scout report, club names and results, and player names with their goals and assists, are sent to Google&apos;s Gemini model to write the report. Ages and photos are not sent.</li>
            <li><strong>Fonts and images:</strong> typefaces load from Google Fonts, and some landing-page visuals and images load from third-party image hosts (including Unsplash).</li>
          </ul>
          <p>When your browser loads content from these services, they receive standard technical details such as your IP address and browser type, and handle them under their own privacy policies.</p>
        </Section>

        <Section icon={Cookie} title="Cookies and browser storage">
          <p>This site does not use advertising or tracking cookies. It keeps two small items in your browser&apos;s local storage:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Visit date:</strong> today&apos;s date, so a visit is only counted once per day.</li>
            <li><strong>Admin session:</strong> for administrators only, so they stay signed in. Firebase also stores its own sign-in data for administrators.</li>
          </ul>
          <p>You can clear these at any time from your browser settings.</p>
        </Section>

        <Section icon={Lock} title="Data security and storage">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Infrastructure:</strong> data is stored on Google Firebase.</li>
            <li><strong>Sign-in:</strong> only authorised administrators can sign in, through Firebase Authentication.</li>
            <li><strong>Access rules:</strong> database rules allow only signed-in administrators to change league data.</li>
          </ul>
          <p>No system is completely secure, but we limit who can change data and record every change.</p>
        </Section>

        <Section icon={Clock} title="How long we keep information">
          <p>League records are kept as a historical archive of each season until an administrator removes them. Activity logs are kept as an audit trail for as long as the league needs them. Personal details are removed sooner if you ask us to (see below).</p>
        </Section>

        <Section icon={UserCheck} title="Your choices and rights">
          <p>If you are a player, club owner or committee member, you can ask us to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Tell you what information we hold about you.</li>
            <li>Correct anything that is wrong.</li>
            <li>Remove your photo or other details from the site.</li>
          </ul>
          <p>
            Some players are under 18. A parent or guardian can make any of these requests for them at any time.
            Please note that removing details from the site does not remove copies already downloaded by others.
          </p>
        </Section>

        <Section icon={RefreshCw} title="Changes to this policy">
          <p>We may update this policy as the site changes. The date below shows when it was last revised.</p>
        </Section>

        <div className="text-center pt-8 border-t border-white/5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Questions or requests about your information:</p>
          <a href="mailto:dfplowners@gmail.com" className="text-accent font-black hover:underline tracking-tighter italic text-lg">dfplowners@gmail.com</a>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Last updated: {LAST_UPDATED}</p>
        </div>
      </motion.div>
    </div>
  );
}
