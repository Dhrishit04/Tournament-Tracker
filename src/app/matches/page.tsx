'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Match, MatchStage, Team } from '@/types';
import { format } from 'date-fns';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { useSeason } from '@/contexts/season-context';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/utils';
import { MatchDetailsDialog } from '@/components/matches/match-details-dialog';

function MatchCard({ match, onCardClick, teams, isGroupMode, showVenue }: { match: Match, onCardClick: (match: Match) => void, teams: Team[], isGroupMode: boolean, showVenue: boolean }) {
  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);

  if (!homeTeam || !awayTeam) {
    return <Card><CardContent className="h-[210px]"><Skeleton className="h-full w-full" /></CardContent></Card>;
  }

  const homeLogo = getImageUrl(homeTeam.logoUrl);
  const awayLogo = getImageUrl(awayTeam.logoUrl);
  const groupName = isGroupMode && match.stage === 'GROUP_STAGE' ? homeTeam.group : null;

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
       <div className="flex-grow cursor-pointer" onClick={() => onCardClick(match)}>
        <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex justify-between items-start text-xs text-muted-foreground w-full">
                <span className="font-semibold">{format(new Date(match.date), 'EEE, MMM d')}</span>
                <Badge variant={match.status === 'FINISHED' ? 'secondary' : 'default'} className={match.status === 'UPCOMING' ? 'bg-accent text-accent-foreground' : ''}>{match.status}</Badge>
            </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
            {groupName && groupName !== 'None' && (
                <div className="flex justify-center mb-3">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-primary border-primary/30">Group {groupName}</Badge>
                </div>
            )}
            <div className="flex items-center justify-center gap-2">
                <div className="flex-1 flex flex-col items-center text-center gap-2">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border">
                        <Image src={homeLogo.imageUrl} alt={homeTeam.name} fill className="object-cover" data-ai-hint={homeLogo.imageHint}/>
                    </div>
                    <span className="font-semibold text-sm truncate w-full">{homeTeam.name}</span>
                </div>
                <div className="text-xl font-bold text-center px-1">
                    {match.status === 'FINISHED' || match.status === 'LIVE' ? (
                    <div className="flex items-center gap-2">
                        <span>{match.homeScore ?? '0'}</span>
                        <span className="text-muted-foreground/30">-</span>
                        <span>{match.awayScore ?? '0'}</span>
                    </div>
                    ) : (
                    <span className="text-lg text-muted-foreground whitespace-nowrap">{match.time}</span>
                    )}
                </div>
                <div className="flex-1 flex flex-col items-center text-center gap-2">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border">
                        <Image src={awayLogo.imageUrl} alt={awayTeam.name} fill className="object-cover" data-ai-hint={awayLogo.imageHint} />
                    </div>
                    <span className="font-semibold text-sm truncate w-full">{awayTeam.name}</span>
                </div>
            </div>
            {showVenue && match.venue && (
                <p className="text-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-4">{match.venue}</p>
            )}
        </CardContent>
      </div>
       {match.stage === 'OTHERS' && match.description && (
            <div className="text-center text-xs text-muted-foreground mt-1 mb-4 border-t mx-6 pt-3 italic">
                {match.description}
            </div>
       )}
    </Card>
  );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-8">
             <Skeleton className="h-10 w-1/3 mb-4" />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-24"/>
                                <Skeleton className="h-6 w-20"/>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col items-center w-2/5 text-center">
                                    <Skeleton className="h-12 w-12 rounded-full mb-2"/>
                                    <Skeleton className="h-5 w-20"/>
                                </div>
                                <Skeleton className="h-7 w-12"/>
                                <div className="flex flex-col items-center w-2/5 text-center">
                                    <Skeleton className="h-12 w-12 rounded-full mb-2"/>
                                    <Skeleton className="h-5 w-20"/>
                                </div>
                            </div>
                            <Skeleton className="h-4 w-1/3 mx-auto mt-3"/>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function MatchesPage() {
  const { matches, teams, loading } = useData();
  const { currentSeason, loading: seasonLoading } = useSeason();
  const { isAdmin } = useAuth();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const pageLoading = loading || seasonLoading || !currentSeason;

  if (pageLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 font-headline">Matches</h1>
        <LoadingSkeleton />
      </div>
    )
  }

  const STAGES: { key: MatchStage, label: string, show: boolean | undefined }[] = [
      { key: 'GROUP_STAGE', label: 'Group Stage', show: currentSeason?.matchConfig.showGroupStage },
      { key: 'QUARTER_FINALS', label: 'Quarter-Finals', show: currentSeason?.matchConfig.showQuarterFinals && teams.length >= 16 },
      { key: 'SEMI_FINALS', label: 'Semi-Finals', show: true },
      { key: 'FINALS', label: 'Finals', show: true },
      { key: 'OTHERS', label: 'Others', show: currentSeason?.matchConfig.showOthers },
  ];

  const matchesByStage: { [key in MatchStage]: Match[] } = {
    GROUP_STAGE: matches.filter(m => m.stage === 'GROUP_STAGE'),
    QUARTER_FINALS: matches.filter(m => m.stage === 'QUARTER_FINALS'),
    SEMI_FINALS: matches.filter(m => m.stage === 'SEMI_FINALS'),
    FINALS: matches.filter(m => m.stage === 'FINALS'),
    OTHERS: matches.filter(m => m.stage === 'OTHERS'),
  };

  const hasAnyMatches = STAGES.some(stage => stage.show && matchesByStage[stage.key].length > 0);
  const isGroupMode = currentSeason?.matchConfig.isGroupModeActive;
  const showVenue = currentSeason?.matchConfig.showVenue ?? true;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Matches</h1>
        {isAdmin && (
            <Button asChild variant="outline">
                <Link href="/admin/matches">
                    <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Match
                </Link>
            </Button>
        )}
      </div>
      <div className="space-y-12">
        {hasAnyMatches ? STAGES.filter(s => s.show).map(stage => {
          const stageMatches = matchesByStage[stage.key];
          if (stageMatches.length === 0) return null;
          
          if (stage.key === 'GROUP_STAGE' && isGroupMode) {
              const groups = Array.from(new Set(stageMatches.map(m => {
                  const homeTeam = teams.find(t => t.id === m.homeTeamId);
                  return homeTeam?.group;
              }).filter(Boolean))).sort() as string[];

              return (
                  <div key={stage.key} className="space-y-10">
                      <h2 className="text-3xl font-semibold mb-6 border-b-2 border-primary pb-2">{stage.label}</h2>
                      {groups.map(group => {
                          const groupMatches = stageMatches.filter(m => teams.find(t => t.id === m.homeTeamId)?.group === group);
                          const upcoming = groupMatches.filter(m => ['UPCOMING', 'LIVE', 'POSTPONED'].includes(m.status));
                          const finished = groupMatches.filter(m => m.status === 'FINISHED');

                          return (
                              <div key={group} className="pl-4 border-l-4 border-primary/20 bg-primary/5 p-4 rounded-r-lg">
                                  <h3 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-accent" />
                                      Group {group}
                                  </h3>
                                  {upcoming.length > 0 && (
                                      <div className="mb-8">
                                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Fixtures</p>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                              {upcoming.map(match => <MatchCard key={match.id} match={match} teams={teams} onCardClick={(m) => setSelectedMatchId(m.id)} isGroupMode={true} showVenue={showVenue} />)}
                                          </div>
                                      </div>
                                  )}
                                  {finished.length > 0 && (
                                      <div>
                                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Results</p>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                              {finished.map(match => <MatchCard key={match.id} match={match} teams={teams} onCardClick={(m) => setSelectedMatchId(m.id)} isGroupMode={true} showVenue={showVenue} />)}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              )
          }

          const upcoming = stageMatches.filter(m => ['UPCOMING', 'LIVE', 'POSTPONED'].includes(m.status));
          const finished = stageMatches.filter(m => m.status === 'FINISHED');

          return (
            <div key={stage.key}>
                <h2 className="text-3xl font-semibold mb-6 border-b-2 border-primary pb-2">{stage.label}</h2>
                {upcoming.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-muted-foreground">Fixtures</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcoming.map(match => <MatchCard key={match.id} match={match} teams={teams} onCardClick={(m) => setSelectedMatchId(m.id)} isGroupMode={false} showVenue={showVenue} />)}
                        </div>
                    </div>
                )}
                 {finished.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-muted-foreground">Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {finished.map(match => <MatchCard key={match.id} match={match} teams={teams} onCardClick={(m) => setSelectedMatchId(m.id)} isGroupMode={false} showVenue={showVenue} />)}
                        </div>
                    </div>
                )}
            </div>
          )
        }) : <p className="text-muted-foreground">No matches scheduled for this season.</p>}
      </div>
      {selectedMatchId && (
        <MatchDetailsDialog
            matchId={selectedMatchId}
            isOpen={!!selectedMatchId}
            onClose={() => setSelectedMatchId(null)}
        />
      )}
    </div>
  );
}
