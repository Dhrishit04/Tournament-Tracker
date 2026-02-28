'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/utils';
import { useSeason } from '@/contexts/season-context';

export default function TeamsPage() {
  const { teams, loading } = useData();
  const { currentSeason } = useSeason();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-6xl relative z-10">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Club <span className="text-gradient-purple">Directory</span></h1>
          <div className="mt-4 inline-flex items-center rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold tracking-widest uppercase text-accent border border-accent/20">
            {currentSeason ? `${currentSeason.name} • 2026` : 'CONNECTING...'}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="items-center p-6">
                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-6xl relative z-10">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Club <span className="text-gradient-purple">Directory</span></h1>
        <p className="text-muted-foreground text-lg mb-6">Explore team identities, rosters, and season statistics.</p>
        <div className="inline-flex items-center rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold tracking-widest uppercase text-accent border border-accent/20">
          {currentSeason ? `${currentSeason.name} • 2026` : 'CONNECTING...'}
        </div>
      </div>
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team) => {
            const logo = getImageUrl(team.logoUrl);
            return (
              <Card key={team.id} className="flex flex-col overflow-hidden bento-card border-none bg-transparent">
                <CardHeader className="flex flex-col items-center text-center p-6 bg-white/5 border-b border-white/5 backdrop-blur-sm">
                  <div className="relative w-24 h-24 rounded-2xl mb-4 border border-white/10 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <Image
                      src={logo.imageUrl}
                      alt={`${team.name} logo`}
                      fill
                      className="object-cover"
                      data-ai-hint={logo.imageHint}
                    />
                  </div>
                  <CardTitle className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">{team.name}</CardTitle>
                  <p className="text-sm text-primary uppercase tracking-widest font-semibold mt-1">{team.owner}</p>
                </CardHeader>
                <CardContent className="p-6 flex-grow flex flex-col justify-between bg-card/20 backdrop-blur-md">
                  <div className="grid grid-cols-3 text-center mb-6">
                    <div>
                      <p className="font-black text-2xl text-foreground">{team.stats.matchesPlayed}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Played</p>
                    </div>
                    <div>
                      <p className="font-black text-2xl text-green-400">{team.stats.matchesWon}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Won</p>
                    </div>
                    <div>
                      <p className="font-black text-2xl text-destructive">{team.stats.matchesLost}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Lost</p>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-auto rounded-full bg-white/10 hover:bg-primary text-foreground dark:text-white border-white/10 hover:border-primary transition-all">
                    <Link href={`/teams/${team.id}`}>
                      View Roster <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg bg-secondary/50">
          <p className="text-muted-foreground text-center">No teams found for this season. <br /> Add teams in the admin panel to get started.</p>
        </div>
      )}
    </div>
  );
}
