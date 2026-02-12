'use client';

import { useData } from '@/hooks/use-data';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Sword } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl, cn } from '@/lib/utils';
import { useSeason } from '@/contexts/season-context';
import { Skeleton } from '@/components/ui/skeleton';
import { type Match, type Team } from '@/types';

export default function BracketPage() {
  const { matches, teams, loading } = useData();
  const { currentSeason } = useSeason();

  if (loading || !currentSeason) {
    return <div className="container mx-auto p-12"><Skeleton className="h-[600px] w-full opacity-10" /></div>;
  }

  const getMatchByStage = (stage: string, index: number = 0) => {
    return matches.filter(m => m.stage === stage)[index];
  };

  const MatchNode = ({ match }: { match?: Match }) => {
    if (!match) return (
      <div className="w-full h-24 border border-white/5 bg-white/5 rounded-2xl flex items-center justify-center opacity-20">
        <span className="text-[10px] font-black uppercase tracking-widest italic">Fixture Pending</span>
      </div>
    );

    const home = teams.find(t => t.id === match.homeTeamId);
    const away = teams.find(t => t.id === match.awayTeamId);

    const TeamRow = ({ team, score, isWinner }: { team?: Team, score?: number, isWinner: boolean }) => (
      <div className={cn(
        "flex items-center justify-between p-3 transition-colors",
        isWinner ? "bg-accent/10" : ""
      )}>
        <div className="flex items-center gap-3 min-w-0">
          {team ? (
            <>
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                <Image src={getImageUrl(team.logoUrl).imageUrl} alt={team.name} fill className="object-cover" />
              </div>
              <span className={cn("text-xs font-black truncate uppercase tracking-tighter", isWinner ? "text-accent" : "text-white/60")}>{team.name}</span>
            </>
          ) : (
            <span className="text-[10px] font-bold opacity-20 uppercase">TBD</span>
          )}
        </div>
        <span className="font-mono font-black text-sm">{score ?? '-'}</span>
      </div>
    );

    const isHomeWinner = match.status === 'FINISHED' && (match.homeScore ?? 0) > (match.awayScore ?? 0);
    const isAwayWinner = match.status === 'FINISHED' && (match.awayScore ?? 0) > (match.homeScore ?? 0);

    return (
      <div className="w-full glass-card border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-white/5 px-3 py-1.5 border-b border-white/5 flex justify-between items-center">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">{match.time} • {match.venue}</span>
          {match.status === 'LIVE' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
        </div>
        <TeamRow team={home} score={match.homeScore} isWinner={isHomeWinner} />
        <div className="h-px bg-white/5 mx-3" />
        <TeamRow team={away} score={match.awayScore} isWinner={isAwayWinner} />
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      <div className="text-center">
        <h1 className="text-6xl font-black font-headline tracking-tighter italic uppercase mb-4 leading-none">The <span className="text-accent">Championship</span> Road</h1>
        <div className="flex items-center justify-center gap-4 text-muted-foreground">
          <div className="h-px w-12 bg-white/10" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Elimination Protocol Active</span>
          <div className="h-px w-12 bg-white/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center relative">
        {/* SEMI FINALS */}
        <div className="space-y-24">
          <div className="text-center mb-8"><span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 px-4 py-1 rounded-full border border-white/5">Semi-Final 1</span></div>
          <MatchNode match={getMatchByStage('SEMI_FINALS', 0)} />
          <div className="text-center mt-12"><span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 px-4 py-1 rounded-full border border-white/5">Semi-Final 2</span></div>
          <MatchNode match={getMatchByStage('SEMI_FINALS', 1)} />
        </div>

        {/* GRAND FINAL */}
        <div className="flex flex-col items-center gap-12">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full scale-150" />
            <div className="relative bg-black border-4 border-accent p-8 rounded-[40px] shadow-2xl">
              <Trophy className="h-20 w-20 text-accent" />
            </div>
          </div>
          <div className="w-full max-w-sm">
            <div className="text-center mb-6"><span className="text-lg font-black italic uppercase tracking-tighter text-accent">Grand Finale</span></div>
            <MatchNode match={getMatchByStage('FINALS')} />
          </div>
        </div>

        {/* OTHERS / BRONZE */}
        <div className="flex flex-col items-center">
          <div className="text-center mb-8"><span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 px-4 py-1 rounded-full border border-white/5">Third Place Playoff</span></div>
          <MatchNode match={getMatchByStage('OTHERS')} />
        </div>
      </div>
    </div>
  );
}
