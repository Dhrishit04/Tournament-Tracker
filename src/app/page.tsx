'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart, Calendar, Shield, Users, Download, Megaphone } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useSeason } from '@/contexts/season-context';
import { useData } from '@/hooks/use-data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { TeamMarquee } from '@/components/ui/team-marquee';

const featureCards = [
  {
    title: 'Live Standings',
    description: 'Real-time analytics and rankings of every club in the league.',
    icon: <BarChart className="h-10 w-10 text-accent" />,
    href: '/standings',
  },
  {
    title: 'Team Rosters',
    description: 'Explore club identities, player profiles, and tactical squad info.',
    icon: <Shield className="h-10 w-10 text-accent" />,
    href: '/teams',
  },
  {
    title: 'Match Center',
    description: 'Upcoming fixtures, live scoreboards, and historical results.',
    icon: <Calendar className="h-10 w-10 text-accent" />,
    href: '/matches',
  },
  {
    title: 'Player Performance',
    description: 'Individual statistics and leaderboards for the top performers.',
    icon: <Users className="h-10 w-10 text-accent" />,
    href: '/players',
  },
];

export function AnnouncementBanner() {
  const { globalAnnouncement } = useSeason();

  if (!globalAnnouncement?.isActive || !globalAnnouncement.message) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] bg-background/60 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] overflow-hidden h-12 flex items-center">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />

      <div className="relative z-20 flex items-center gap-3 px-6 h-full bg-accent/90 backdrop-blur-md border-r border-white/10 shadow-[5px_0_20px_rgba(0,0,0,0.5)]">
        <div className="bg-white rounded-full p-1.5 shadow-sm">
          <Megaphone className="h-3 w-3 text-accent fill-accent" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white drop-shadow-sm">Broadcast</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex items-center gap-12 whitespace-nowrap animate-marquee py-1.5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-12">
              <p className="font-bold tracking-wide text-sm uppercase text-foreground drop-shadow-sm">
                {globalAnnouncement.message}
              </p>
              <span className="text-accent text-xl font-black">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
  const { currentSeason, loading: seasonLoading } = useSeason();
  const { teams, players, matches, loading: dataLoading } = useData();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yHeroGlow = useTransform(scrollYProgress, [0, 1], [0, 300]);

  const handleDownloadExcel = () => {
    if (!currentSeason || !teams) return;
    const seasonNum = currentSeason.name.split(' ')[1] || currentSeason.id.replace('season-', '');
    const filename = `dfpl_S${seasonNum}.xlsx`;

    const standings = teams.map(team => {
      const stats = team.stats;
      return {
        Rank: 0,
        Team: team.name,
        Group: team.group || 'N/A',
        MP: stats.matchesPlayed || 0,
        W: stats.matchesWon || 0,
        D: stats.matchesDrawn || 0,
        L: stats.matchesLost || 0,
        GF: stats.totalGoals || 0,
        GA: stats.goalsAgainst || 0,
        GD: (stats.totalGoals || 0) - (stats.goalsAgainst || 0),
        Pts: (stats.matchesWon || 0) * 3 + (stats.matchesDrawn || 0),
      };
    }).sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.Team.localeCompare(b.Team));
    standings.forEach((s, i) => s.Rank = i + 1);

    const teamStats = teams.map(team => ({
      'Team Name': team.name,
      'Owner': team.owner,
      'Group': team.group || 'N/A',
      'Matches Played': team.stats.matchesPlayed || 0,
      'Won': team.stats.matchesWon || 0,
      'Drawn': team.stats.matchesDrawn || 0,
      'Lost': team.stats.matchesLost || 0,
      'Goals Scored': team.stats.totalGoals || 0,
      'Goals Against': team.stats.goalsAgainst || 0,
      'Total Assists': team.stats.totalAssists || 0,
      'Yellow Cards': team.stats.totalYellowCards || 0,
      'Red Cards': team.stats.totalRedCards || 0,
    }));

    const playersData = players.map(p => {
      const team = teams.find(t => t.id === p.teamId);
      return {
        'Name': p.name,
        'Team': team?.name || 'Unassigned',
        'Category': p.category,
        'Age': p.age || 'N/A',
        'Position': p.preferredPosition?.join(', ') || 'N/A',
        'Matches Played': p.matchesPlayed || 0,
        'Goals': p.goals || 0,
        'Assists': p.assists || 0,
        'Yellow Cards': p.yellowCards || 0,
        'Red Cards': p.redCards || 0,
      };
    });

    const activeStageKeys = ([
      currentSeason.matchConfig?.showGroupStage ? 'GROUP_STAGE' : null,
      (currentSeason.matchConfig?.showQuarterFinals && teams.length >= 16) ? 'QUARTER_FINALS' : null,
      'SEMI_FINALS',
      'FINALS',
      currentSeason.matchConfig?.showOthers ? 'OTHERS' : null
    ].filter(Boolean) as string[]);

    const matchesData = matches
      .filter(m => m.stage && activeStageKeys.includes(m.stage))
      .map(m => {
        const hTeam = teams.find(t => t.id === m.homeTeamId);
        const aTeam = teams.find(t => t.id === m.awayTeamId);
        return {
          'Date': m.date instanceof Date ? m.date.toLocaleDateString() : new Date(m.date).toLocaleDateString(),
          'Time': m.time,
          'Stage': m.stage,
          'Home Team': hTeam?.name || 'Unknown',
          'Away Team': aTeam?.name || 'Unknown',
          'Home Score': m.homeScore ?? 0,
          'Away Score': m.awayScore ?? 0,
          'Status': m.status,
          'Venue': m.venue || 'TBD',
        };
      });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(standings), "Standings");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamStats), "Team Stats");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(playersData), "Players");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matchesData), "Matches");
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="flex flex-col overflow-x-hidden">
      <AnnouncementBanner />

      <section ref={heroRef} className="relative min-h-[90vh] w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-background">
          <iframe
            src="https://www.youtube.com/embed/7D1BO0a9vTo?autoplay=1&mute=1&controls=0&loop=1&playlist=7D1BO0a9vTo&playsinline=1&rel=0&modestbranding=1"
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
            allow="autoplay; encrypted-media"
          />
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        {/* Glow Effects (Parallaxed) */}
        <motion.div style={{ y: yHeroGlow }} className="absolute inset-0 z-[1] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        </motion.div>

        <motion.div
          className="relative z-10 max-w-5xl mx-auto flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ y: yHeroText }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8 inline-flex items-center rounded-full bg-white/5 px-6 py-2.5 text-base font-bold tracking-widest uppercase text-primary border border-white/10 backdrop-blur-md glow-purple"
          >
            {seasonLoading || !currentSeason ? 'CONNECTING...' : `${currentSeason.name} • 2026`}
          </motion.div>

          <h1 className="font-headline text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-foreground leading-none mb-6">
            DFPL <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">ULTIMATE</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Experience the next generation of tournament management. Intelligent insights, pristine performance tracking, and absolute clarity for your league.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="animated-border rounded-full h-14 px-10 font-bold text-lg text-primary-foreground hover-lift">
              <Link href="/standings">
                Enter Standings <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 border-white/10 dark:bg-white/5 bg-black/5 backdrop-blur-md text-foreground hover:bg-black/10 dark:hover:bg-white/10 dark:hover:border-white/20 rounded-full font-bold text-lg hover-lift">
              <Link href="/matches">View Schedule</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <TeamMarquee />

      <section className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Everything you need — in one <span className="text-gradient-purple">intelligent dashboard.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Goodbye to chaos. Track every metric, evaluate player performance, and keep your teams organized with our pristine environment.
            </p>
          </motion.div>

          {/* Bento Grid with Spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100 }}
                className={cn(
                  "block h-full",
                  index === 0 || index === 3 ? "md:col-span-2" : "md:col-span-1"
                )}
              >
                <Link href={card.href} className="block h-full">
                  <SpotlightCard className="h-full p-8 flex flex-col justify-between overflow-hidden">
                    <div className="absolute -right-8 -top-8 opacity-5 transition-opacity duration-500 group-hover:opacity-20 scale-150">
                      {card.icon}
                    </div>

                    <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                      {card.icon}
                    </div>

                    <div className="relative z-20">
                      <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{card.description}</p>
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight max-w-3xl">
            Start your best season. <br /> <span className="text-gradient-purple">Effortlessly.</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl">
            Join the Dongre Football Premier League experience. No chaos, just clean mechanics and pure football insights.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-10 h-14 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.3)] hover-lift hover-glow">
            <Link href="/teams">Discover Teams</Link>
          </Button>
        </div>
      </section>

      <section className="py-12 bg-card border-t border-white/5 relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold tracking-tight uppercase">Tournament Archive</h3>
            <p className="text-sm text-muted-foreground">Download entire season data including standings, club stats, and athlete registries.</p>
          </div>
          <Button
            onClick={handleDownloadExcel}
            disabled={seasonLoading || dataLoading || !currentSeason}
            variant="outline"
            className="h-12 px-8 rounded-full font-bold border-accent/20 hover:bg-accent/10 hover:text-accent transition-all whitespace-nowrap"
          >
            <Download className="mr-2 h-4 w-4" /> Download Season Data
          </Button>
        </div>
      </section>
    </div>
  );
}
