'use client';

import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Goal, Footprints } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSeason } from '@/contexts/season-context';

export default function StatisticsPage() {
  const { players, teams, loading } = useData();
  const { currentSeason } = useSeason();

  const topScorers = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0)).slice(0, 10);
  const topPlaymakers = [...players].sort((a, b) => (b.assists || 0) - (a.assists || 0)).slice(0, 10);

  const getTeamName = (tid: string) => teams.find(t => t.id === tid)?.name || 'Unassigned';

  const Leaderboard = ({ data, type }: { data: any[], type: 'goals' | 'assists' }) => (
    <Table>
      <TableHeader>
        <TableRow className="border-white/5 hover:bg-transparent">
          <TableHead className="w-16 h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Rank</TableHead>
          <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Athlete</TableHead>
          <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Club</TableHead>
          <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">{type === 'goals' ? 'Goals' : 'Assists'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((player, idx) => {
          const avatar = getImageUrl(player.avatarUrl);
          const isTop3 = idx < 3;
          return (
            <TableRow key={player.id} className="border-white/5 transition-all duration-300 hover:bg-accent/5 hover:shadow-[inset_2px_0_0_0_hsl(var(--accent))] relative group">
              <TableCell className="text-center">
                {idx === 0 ? <Trophy className="h-5 w-5 text-yellow-500 mx-auto" /> :
                  idx === 1 ? <Medal className="h-5 w-5 text-slate-300 mx-auto" /> :
                    idx === 2 ? <Medal className="h-5 w-5 text-orange-400 mx-auto" /> :
                      <span className="font-mono font-black text-xs opacity-30">{idx + 1}</span>}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                    <Image src={avatar.imageUrl} alt={player.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-tight">{player.name}</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Elite Athlete</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs font-bold opacity-60">{getTeamName(player.teamId)}</span>
              </TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  "font-mono font-black text-lg",
                  isTop3 ? "text-accent" : "text-white/80"
                )}>
                  {type === 'goals' ? player.goals : player.assists}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-10">
        <Skeleton className="h-12 w-64 opacity-20" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[600px] w-full opacity-10" />
          <Skeleton className="h-[600px] w-full opacity-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-6xl relative z-10 space-y-12">
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Elite <span className="text-gradient-purple">Stats</span></h1>
        <p className="text-muted-foreground text-lg">Season Leaderboards and Individual Brilliance.</p>
        <div className="mt-6 inline-flex items-center rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold tracking-widest uppercase text-accent border border-accent/20">
          {currentSeason ? `${currentSeason.name} • 2026` : 'CONNECTING...'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent"><Goal className="h-6 w-6" /></div>
            <div>
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Golden Boot</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Top goal scoring athletes</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Leaderboard data={topScorers} type="goals" />
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400"><Footprints className="h-6 w-6" /></div>
            <div>
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Playmaker Hub</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Top assist providers</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Leaderboard data={topPlaymakers} type="assists" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
