'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart, Calendar, Shield, Users, Download, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useSeason } from '@/contexts/season-context';
import { useData } from '@/hooks/use-data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

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
        <div className="relative z-50 bg-primary border-b border-primary/20 shadow-xl overflow-hidden h-12 flex items-center">
            {/* Animated subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
            
            {/* Sticky "Broadcast" indicator using the accent color for high contrast */}
            <div className="relative z-20 flex items-center gap-3 px-6 h-full bg-accent border-r border-white/10 shadow-[5px_0_15px_rgba(0,0,0,0.3)]">
                <div className="bg-white rounded-full p-1.5 shadow-sm">
                    <Megaphone className="h-3 w-3 text-accent fill-accent" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white drop-shadow-sm">Broadcast</span>
            </div>
            
            {/* Continuous ticker content */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex items-center gap-12 whitespace-nowrap animate-marquee py-1.5">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-12">
                            <p className="font-bold tracking-wide text-sm uppercase text-white/90 shadow-black/20 drop-shadow-sm">
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
        currentSeason.matchConfig.showGroupStage ? 'GROUP_STAGE' : null,
        (currentSeason.matchConfig.showQuarterFinals && teams.length >= 16) ? 'QUARTER_FINALS' : null,
        'SEMI_FINALS',
        'FINALS',
        currentSeason.matchConfig.showOthers ? 'OTHERS' : null
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
      
      <section className="relative h-[85vh] w-full flex items-center justify-center text-center px-4">
        {heroImage && (
          <div className="absolute inset-0">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover object-center scale-105"
              priority
              data-ai-hint={heroImage.imageHint}
            />
            {/* Professional darkening overlay */}
            <div className="absolute inset-0 bg-black/50" />
            {/* Subtle bottom fade to background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>
        )}
        
        <motion.div
          className="relative z-10 max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-bold tracking-widest text-accent uppercase backdrop-blur-sm border border-accent/30"
          >
            {seasonLoading || !currentSeason ? 'Loading Tournament...' : `${currentSeason.name} • ${currentSeason.year}`}
          </motion.div>
          
          <h1 className="font-headline text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white drop-shadow-2xl leading-[0.9]">
            DFPL <span className="text-accent italic">ULTIMATE</span>
          </h1>
          
          <p className="mt-8 text-lg md:text-2xl text-white/80 font-medium max-w-2xl mx-auto drop-shadow-lg">
            The nexus of competitive football. Experience the next generation of tournament management and performance tracking.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-10 bg-accent hover:bg-accent/90 text-white font-bold text-lg rounded-full shadow-[0_0_20px_rgba(255,87,34,0.4)] transition-all hover:scale-105">
              <Link href="/standings">
                Enter Standings <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 rounded-full font-bold text-lg transition-all">
              <Link href="/matches">View Schedule</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="py-24 bg-background relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-30" />
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-center mb-4 tracking-tight">
              THE <span className="text-accent">ECOSYSTEM</span>
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={card.href} className="group block h-full">
                  <Card className="h-full bg-card/40 backdrop-blur-sm border-white/5 transition-all duration-500 hover:bg-card/60 hover:border-accent/40 hover:-translate-y-2 overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                        {card.icon}
                    </div>
                    <CardHeader className="pt-8 pb-4">
                      <div className="mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        {card.icon}
                      </div>
                      <CardTitle className="text-2xl font-bold tracking-tight group-hover:text-accent transition-colors">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{card.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-10">
          <Image src={heroImage?.imageUrl || ''} alt="background" fill className="object-cover grayscale" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              READY TO <br /> <span className="text-accent italic">DOMINATE</span> THE FIELD?
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-xl">
              Join the Dongre Football Premier League. Track every goal, analyze every assist, and witness the glory.
            </p>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-10 h-14 rounded-full">
                <Link href="/teams">Discover Teams</Link>
            </Button>
          </div>
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
