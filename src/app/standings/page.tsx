'use client';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Pencil } from 'lucide-react';

import type { Standing, Team, TeamStats } from '@/types';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSeason } from '@/contexts/season-context';

const standingEditSchema = z.object({
  matchesPlayed: z.coerce.number().min(0),
  matchesWon: z.coerce.number().min(0),
  matchesDrawn: z.coerce.number().min(0),
  matchesLost: z.coerce.number().min(0),
  totalGoals: z.coerce.number().min(0),
  goalsAgainst: z.coerce.number().min(0),
});


function TeamCell({ team }: { team: Standing['team'] }) {
  const logo = getImageUrl(team.logoUrl);
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8 rounded-full overflow-hidden">
        <Image
          src={logo.imageUrl}
          alt={`${team.name} logo`}
          fill
          className="object-cover"
          data-ai-hint={logo.imageHint}
        />
      </div>
      <span className="font-medium">{team.name}</span>
    </div>
  );
}

function StandingsEditForm({
    team,
    onSubmit,
    onClose,
}: {
    team: Team;
    onSubmit: (data: z.infer<typeof standingEditSchema>) => void;
    onClose: () => void;
}) {
    const form = useForm<z.infer<typeof standingEditSchema>>({
        resolver: zodResolver(standingEditSchema),
        defaultValues: {
            matchesPlayed: team.stats.matchesPlayed || 0,
            matchesWon: team.stats.matchesWon || 0,
            matchesDrawn: team.stats.matchesDrawn || 0,
            matchesLost: team.stats.matchesLost || 0,
            totalGoals: team.stats.totalGoals || 0,
            goalsAgainst: team.stats.goalsAgainst || 0,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 grid grid-cols-2 gap-4">
                <FormField control={form.control} name="matchesPlayed" render={({ field }) => (
                    <FormItem><FormLabel>Played</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="matchesWon" render={({ field }) => (
                    <FormItem><FormLabel>Won</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="matchesDrawn" render={({ field }) => (
                    <FormItem><FormLabel>Drawn</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="matchesLost" render={({ field }) => (
                    <FormItem><FormLabel>Lost</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="totalGoals" render={({ field }) => (
                    <FormItem><FormLabel>Goals For</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="goalsAgainst" render={({ field }) => (
                    <FormItem><FormLabel>Goals Against</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter className="col-span-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

function StandingsTable({ standings, isAdmin, onEditClick }: { standings: Standing[], isAdmin: boolean, onEditClick: (id: string) => void }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-center">Rank</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center">MP</TableHead>
                        <TableHead className="text-center">W</TableHead>
                        <TableHead className="text-center">D</TableHead>
                        <TableHead className="text-center">L</TableHead>
                        <TableHead className="text-center">GF</TableHead>
                        <TableHead className="text-center">GA</TableHead>
                        <TableHead className="text-center">GD</TableHead>
                        <TableHead className="font-bold text-center">Pts</TableHead>
                        {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {standings.map((standing) => (
                        <TableRow key={standing.team.id}>
                            <TableCell className="font-bold text-center">{standing.rank}</TableCell>
                            <TableCell>
                                <TeamCell team={standing.team} />
                            </TableCell>
                            <TableCell className="text-center">{standing.played}</TableCell>
                            <TableCell className="text-center">{standing.won}</TableCell>
                            <TableCell className="text-center">{standing.drawn}</TableCell>
                            <TableCell className="text-center">{standing.lost}</TableCell>
                            <TableCell className="text-center">{standing.goalsFor}</TableCell>
                            <TableCell className="text-center">{standing.goalsAgainst}</TableCell>
                            <TableCell className="text-center">{standing.goalDifference}</TableCell>
                            <TableCell className="font-bold text-center">{standing.points}</TableCell>
                            {isAdmin && (
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => onEditClick(standing.team.id)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">MP</TableHead>
                  <TableHead className="text-center">W</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">GF</TableHead>
                  <TableHead className="text-center">GA</TableHead>
                  <TableHead className="text-center">GD</TableHead>
                  <TableHead className="text-center">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-5 mx-auto"/></TableCell>
                        <TableCell><div className='flex items-center gap-3'><Skeleton className="w-8 h-8 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                        <TableCell><Skeleton className="h-5 w-5 mx-auto"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-5 mx-auto"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-5 mx-auto"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-5 mx-auto"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-5 mx-auto"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-5 mx-auto"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-5 mx-auto"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-5 mx-auto"/></TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
    )
}

export default function StandingsPage() {
  const { teams, players, loading, updateTeam } = useData();
  const { currentSeason, loading: seasonLoading } = useSeason();
  const { isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { toast } = useToast();

  const isGroupMode = currentSeason?.matchConfig?.isGroupModeActive || false;

  const standingsData = useMemo(() => {
    if (!teams || teams.length === 0) return { groups: {}, standalone: [] };

    const calculateStanding = (team: Team) => {
        const { stats } = team;
        const points = (stats.matchesWon || 0) * 3 + (stats.matchesDrawn || 0);
        const goalDifference = (stats.totalGoals || 0) - (stats.goalsAgainst || 0);
        return {
            rank: 0,
            team: { id: team.id, name: team.name, logoUrl: team.logoUrl, group: team.group },
            played: stats.matchesPlayed || 0,
            won: stats.matchesWon || 0,
            drawn: stats.matchesDrawn || 0,
            lost: stats.matchesLost || 0,
            goalsFor: stats.totalGoals || 0,
            goalsAgainst: stats.goalsAgainst || 0,
            goalDifference: goalDifference,
            points: points,
        } as Standing;
    };

    // Standard sorting: Points -> GD -> GF -> Alphabetical
    const sortStanding = (a: Standing, b: Standing) => {
        return (
            b.points - a.points || 
            b.goalDifference - a.goalDifference || 
            b.goalsFor - a.goalsFor || 
            a.team.name.localeCompare(b.team.name)
        );
    };

    if (isGroupMode) {
        const groups: Record<string, Standing[]> = {};
        teams.forEach(team => {
            const groupKey = (team.group && team.group !== 'None') ? team.group : 'Unassigned';
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(calculateStanding(team));
        });

        Object.keys(groups).forEach(key => {
            groups[key].sort(sortStanding)
            .forEach((standing, index) => {
                standing.rank = index + 1;
            });
        });
        return { groups, standalone: [] };
    } else {
        const standalone = teams.map(calculateStanding).sort(sortStanding);
        standalone.forEach((s, i) => s.rank = i + 1);
        return { groups: {}, standalone };
    }
  }, [teams, isGroupMode]);
  
  const handleEditClick = (teamId: string) => {
    const teamToEdit = teams.find(t => t.id === teamId);
    if (teamToEdit) {
        setSelectedTeam(teamToEdit);
        setIsDialogOpen(true);
    }
  }

  const handleFormSubmit = (data: z.infer<typeof standingEditSchema>) => {
    if (!selectedTeam) return;

    const teamPlayers = players.filter(p => p.teamId === selectedTeam.id);
    const totalPlayerGoals = teamPlayers.reduce((acc, p) => acc + (p.goals || 0), 0);
    
    if (data.totalGoals < totalPlayerGoals) {
        toast({
            variant: 'destructive',
            title: 'Invalid Goal Count',
            description: `Total goals cannot be less than the sum of player goals (${totalPlayerGoals}).`,
        });
        return;
    }

    const currentTeamStats = teams.find(t => t.id === selectedTeam.id)?.stats;
    if (!currentTeamStats) return;

    const updatedTeamStats: TeamStats = {
        ...currentTeamStats,
        ...data,
    };
    
    const updatedTeam: Team = {
        ...selectedTeam,
        stats: updatedTeamStats
    };

    updateTeam(updatedTeam);
    setIsDialogOpen(false);
    setSelectedTeam(null);
  }

  const pageLoading = loading || seasonLoading;
  const groupKeys = Object.keys(standingsData.groups).sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">League Standings</h1>
      <div className="space-y-12">
        {pageLoading ? <Card><CardContent><LoadingSkeleton /></CardContent></Card> : (
            isGroupMode ? (
                groupKeys.length > 0 ? groupKeys.map(key => (
                    <Card key={key}>
                        <CardHeader>
                            <CardTitle>Group {key}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StandingsTable 
                                standings={standingsData.groups[key]} 
                                isAdmin={isAdmin} 
                                onEditClick={handleEditClick} 
                            />
                        </CardContent>
                    </Card>
                )) : (
                    <Card><CardContent><p className="text-muted-foreground text-center py-10">No groups configured.</p></CardContent></Card>
                )
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Standalone Standings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {standingsData.standalone.length > 0 ? (
                            <StandingsTable 
                                standings={standingsData.standalone} 
                                isAdmin={isAdmin} 
                                onEditClick={handleEditClick} 
                            />
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No teams found for this season.</p>
                        )}
                    </CardContent>
                </Card>
            )
        )}
      </div>

      {selectedTeam && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Stats: {selectedTeam.name}</DialogTitle>
                    <DialogDescription>Manually override team statistics. This will reflect in the standings.</DialogDescription>
                </DialogHeader>
                <StandingsEditForm
                    team={selectedTeam}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsDialogOpen(false)}
                />
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
