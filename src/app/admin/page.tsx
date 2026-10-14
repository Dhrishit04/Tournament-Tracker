'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Calendar, Settings, ArrowUpRight, Radio, Sparkles, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/hooks/use-data';
import { useSeason } from '@/contexts/season-context';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { analyzeSeason, type AnalyzeSeasonOutput } from '@/ai/flows/season-scout-flow';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { CountUp } from '@/components/ui/animations';

const EASE = [0.16, 1, 0.3, 1] as const;

// night-football photography behind each section card (Unsplash, free licence)
const STILLS = ['card-players', 'card-teams', 'card-fixtures', 'card-settings']
  .map((n) => `/images/football/${n}.jpg`);

/* the AI summary arrives a word at a time */
function TypeIn({ text }: { text: string }) {
  return (
    <motion.p
      className="text-[15px] font-light leading-[1.7] text-[#c2cdc5]"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.035 } } }}
    >
      {text.split(' ').map((w, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          variants={{ hidden: { opacity: 0, y: 8, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: EASE } } }}
        >
          {w + ' '}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default function AdminDashboardPage() {
  const { teams, players, matches, loading } = useData();
  const { globalAnnouncement, updateGlobalAnnouncement, currentSeason, isSessionActive } = useSeason();
  const { isSystemAdmin, user } = useAuth();

  const [announcementText, setAnnouncementText] = useState('');
  const [isBroadcastActive, setIsBroadcastActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<AnalyzeSeasonOutput | null>(null);

  // Sync internal state with context when data loads
  useEffect(() => {
    if (globalAnnouncement) {
      setAnnouncementText(globalAnnouncement.message || '');
      setIsBroadcastActive(globalAnnouncement.isActive || false);
    }
  }, [globalAnnouncement]);

  const dashboardCards = useMemo(() => {
    const cards = [
      { title: 'Players', icon: <Users className="h-5 w-5" />, href: '/admin/players', description: 'Roster & performance control' },
      { title: 'Teams', icon: <Shield className="h-5 w-5" />, href: '/admin/teams', description: 'Team identities & global stats' },
      { title: 'Fixtures', icon: <Calendar className="h-5 w-5" />, href: '/admin/matches', description: 'Schedule & live match engine' },
    ];

    if (isSystemAdmin || user?.canAccessSettings) {
      cards.push({ title: 'Settings', icon: <Settings className="h-5 w-5" />, href: '/admin/settings', description: 'System-wide season settings' });
    }

    return cards;
  }, [isSystemAdmin, user?.canAccessSettings]);

  const stats = [
    { label: 'Total Teams', value: teams.length },
    { label: 'Total Players', value: players.length },
    { label: 'Fixtures Logged', value: matches.length },
  ];

  const handleSaveMessage = () => {
    updateGlobalAnnouncement({
      message: announcementText,
      isActive: isBroadcastActive
    });
  };

  const handleToggleBroadcast = (checked: boolean) => {
    setIsBroadcastActive(checked);
    updateGlobalAnnouncement({
      message: announcementText,
      isActive: checked
    });
  };

  const handleRunAiScout = async () => {
    if (!currentSeason) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeSeason({
        teams,
        players,
        seasonName: currentSeason.name
      });
      setAiReport(result);
    } catch (error) {
      console.error("AI Scout failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };


  return (
    <div className="space-y-[clamp(40px,7vh,80px)]">
      {/* ---------------------------------------------------------------- header */}
      <div className="grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <h1 className="text-4xl font-black md:text-6xl">Command <span className="text-gradient-purple">Center</span></h1>
          <p className="mt-4 max-w-[46ch] text-[clamp(14px,1.02vw,17px)] font-light leading-[1.72] text-[#b4bfb7]">
            Tournament intelligence and administrative gateway.
          </p>
        </div>
        <div className={cn(
          'k-label flex items-center gap-3 justify-self-start rounded-full border px-5 py-3 transition-colors duration-500',
          isSessionActive ? 'border-primary/40 text-foreground' : 'border-[rgba(223,231,224,.13)] text-muted-foreground'
        )}>
          <span className="relative flex h-2 w-2">
            {isSessionActive && <span className="absolute inset-0 animate-ping rounded-full bg-primary" />}
            <span className={cn('relative h-2 w-2 rounded-full', isSessionActive ? 'bg-primary shadow-[0_0_10px_hsl(var(--primary))]' : 'bg-muted-foreground')} />
          </span>
          {isSessionActive ? 'Session Active' : 'Session Offline'}
        </div>
      </div>

      {/* ---------------------------------------------------------------- figures (template .gate-stats) */}
      <div className="grid grid-cols-3 gap-[clamp(16px,4vw,62px)] border-t border-[rgba(223,231,224,.07)] pt-6">
        {stats.map((s) => (
          <div key={s.label}>
            {loading ? <Skeleton className="h-12 w-20" /> : (
              <CountUp pad value={s.value} className="block text-[clamp(32px,4vw,64px)] font-light leading-none tracking-[-.02em]" />
            )}
            <span className="k-label mt-3 block text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------------------- sections (template .cards, stepped) */}
      <div className="grid grid-cols-1 gap-[clamp(10px,1.4vw,22px)] sm:grid-cols-2 lg:grid-cols-4 lg:pb-16">
        {dashboardCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease: EASE, delay: 0.15 + idx * 0.09 }}
          >
            {/* the step lives on the link: framer owns the wrapper's transform */}
            <Link href={card.href} className="group block lg:translate-y-[calc(var(--i)*22px)]" style={{ '--i': idx } as React.CSSProperties}>
              <div className="relative aspect-[4/5] overflow-hidden outline outline-1 -outline-offset-1 outline-[rgba(223,231,224,.07)] transition-[outline-color] duration-500 group-hover:outline-[rgba(223,231,224,.3)] sm:aspect-[4/5] max-sm:aspect-[16/10]">
                <div
                  className="absolute inset-0 scale-[1.06] bg-cover bg-center brightness-[.55] saturate-[.85] transition-[transform,filter] duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-100 group-hover:brightness-[.8]"
                  style={{ backgroundImage: `url(${STILLS[idx % STILLS.length]})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,9,.1)_30%,rgba(3,6,9,.86)_100%)]" />
                <span className="absolute left-4 top-4 text-[10px] tracking-[.18em] text-[hsl(var(--bone-dim))]">0{idx + 1}</span>
                <span className="absolute right-4 top-4 grid h-[34px] w-[34px] translate-x-[-4px] translate-y-[4px] place-items-center rounded-full border border-[rgba(223,231,224,.3)] opacity-0 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
                <div className="absolute inset-x-4 bottom-4">
                  <span className="mb-3 block text-primary [&_svg]:h-4 [&_svg]:w-4">{card.icon}</span>
                  <p className="text-[clamp(15px,1.2vw,19px)] uppercase leading-tight tracking-[.02em]">{card.title}</p>
                  <p className="mt-2 text-xs font-light leading-relaxed text-[hsl(var(--bone-dim))]">{card.description}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ---------------------------------------------------------------- consoles */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle><Radio /> Broadcast Hub</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between gap-6">
                <div className="space-y-1">
                  <Label htmlFor="broadcast-toggle">Public Ticker Status</Label>
                  <p className="text-xs font-light text-muted-foreground">Live updates appear on the homepage ecosystem.</p>
                </div>
                <Switch
                  id="broadcast-toggle"
                  checked={isBroadcastActive}
                  onCheckedChange={handleToggleBroadcast}
                />
              </div>

              {/* live preview of the homepage ticker */}
              <div className="flex h-10 items-center overflow-hidden border border-[rgba(223,231,224,.07)]">
                <span className="k-label flex h-full shrink-0 items-center gap-2.5 border-r border-[rgba(223,231,224,.07)] px-4">
                  <span className={cn('h-[5px] w-[5px] rounded-full transition-colors', isBroadcastActive ? 'animate-pulse bg-primary shadow-[0_0_10px_hsl(var(--primary))]' : 'bg-muted-foreground')} />
                  {isBroadcastActive ? 'On air' : 'Off air'}
                </span>
                <div className="flex flex-1 overflow-hidden">
                  <div className={cn('flex animate-marquee items-center gap-12 whitespace-nowrap', !isBroadcastActive && 'opacity-40')}>
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className="k-label text-[hsl(var(--bone-dim))]">
                        {announcementText || 'Your announcement preview'}<span className="ml-12 text-primary">·</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Type a flash announcement (e.g., Match delayed, Results updated...)"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="h-12"
                />
                <Button onClick={handleSaveMessage} className="h-12 px-7">
                  <Save /> Save
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={cn('overflow-hidden', isAnalyzing && 'k-scanning')}>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0">
              <CardTitle><Sparkles /> AI Season Scout</CardTitle>
              <Button variant="outline" size="sm" onClick={handleRunAiScout} disabled={isAnalyzing || loading}>
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {aiReport ? "Re-Analyze Data" : "Generate Scout Report"}
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                {aiReport ? (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="border-l border-primary pl-5">
                      <TypeIn text={`"${aiReport.summary}"`} />
                    </div>
                    <div className="grid grid-cols-1 gap-6 border-t border-[rgba(223,231,224,.07)] pt-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <p className="k-label text-muted-foreground">Dominant Force</p>
                        <p className="text-lg font-light uppercase tracking-[.02em]">{aiReport.topTeam}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="k-label text-muted-foreground">Key Performer</p>
                        <p className="text-lg font-light uppercase tracking-[.02em]">{aiReport.topPlayer}</p>
                      </div>
                      <div className="space-y-2 border border-primary/30 bg-primary/5 p-4 sm:col-span-2">
                        <p className="k-label text-primary">Tactical Alert</p>
                        <p className="text-sm font-light text-[#e6b8b2]">{aiReport.alert}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="idle" exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="relative mb-5 grid h-14 w-14 place-items-center rounded-full border border-[rgba(223,231,224,.13)]">
                      {isAnalyzing && <span className="absolute inset-0 animate-ping rounded-full border border-primary/50" />}
                      <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.25} />
                    </div>
                    <p className={cn('text-sm font-light text-muted-foreground', isAnalyzing && 'k-caret')}>
                      {isAnalyzing ? 'Reading the season' : 'Click generate to let AI analyze the current tournament momentum.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="overflow-hidden border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle>Admin Protocol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <p className="text-sm font-light leading-relaxed text-[#c2cdc5]">
                {teams.length === 0 ? (
                  "Initialize the tournament by deploying teams and registering elite athletes via the registry."
                ) : players.length < (teams.length * 4) ? (
                  "Some clubs have insufficient athlete registration. Protocol requires 4+ per team for group mode stability."
                ) : (
                  "The DFPL network is fully operational. Public broadcasts will reflect live data changes in real-time."
                )}
              </p>
              <div className="k-label border-t border-[rgba(223,231,224,.07)] pt-4 text-muted-foreground">
                Persistent Data Policy Enabled
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
