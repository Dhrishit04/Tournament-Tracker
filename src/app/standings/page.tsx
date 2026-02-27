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
import { motion } from 'framer-motion';

import type { Standing, Team, TeamStats } from '@/types';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl, cn } from '@/lib/utils';
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
      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/5 shadow-sm">
        <Image
          src={logo.imageUrl}
          alt={`${team.name} logo`}
          fill
          className="object-cover"
          data-ai-hint={logo.imageHint}
        />
      </div>
      <span className="font-bold tracking-tight uppercase text-xs">{team.name}</span>
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
        <div className="overflow-x-auto custom-scrollbar">
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10">
                        <TableHead className="w-[50px] text-center text-[10px] font-black uppercase tracking-widest">Rank</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Club</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest">MP</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest">W</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest">D</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest">L</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest">GF</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest">GA</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest">GD</TableHead>
                        <TableHead className="font-black text-center text-[10px] uppercase tracking-widest text-accent">Pts</TableHead>
                        {isAdmin && <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Edit</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {standings.map((standing, idx) => (
                        <TableRow key={standing.team.id} className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="font-black text-center text-sm opacity-40">{standing.rank}</TableCell>
                            <TableCell>
                                <TeamCell team={standing.team} />
                            </TableCell>
                            <TableCell className="text-center font-mono text-sm">{standing.played}</TableCell>
                            <TableCell className="text-center font-mono text-sm text-green-500/80">{standing.won}</TableCell>
                            <TableCell className="text-center font-mono text-sm">{standing.drawn}</TableCell>
                            <TableCell className="text-center font-mono text-sm text-red-500/80">{standing.lost}</TableCell>
                            <TableCell className="text-center font-mono text-sm">{standing.goalsFor}</TableCell>
                            <TableCell className="text-center font-mono text-sm">{standing.goalsAgainst}</TableCell>
                            <TableCell className={cn(
                                "text-center font-mono text-sm font-bold",
                                standing.goalDifference > 0 ? "text-blue-400" : standing.goalDifference < 0 ? "text-destructive" : ""
                            )}>
                                {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                            </TableCell>
                            <TableCell className="font-black text-center text-base text-accent">{standing.points}</TableCell>
                            {isAdmin && (
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => onEditClick(standing.team.id)} className="hover:bg-accent/10 hover:text-accent h-8 w-8">
                                        <Pencil className="h-3.5 w-3.5" />
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
        <div className="overflow-x-auto custom-scrollbar">
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
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-black font-headline tracking-tighter italic uppercase mb-2">League <span className="text-accent">Standings</span></h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Real-time tournament positioning and competitive analytics.</p>
      </motion.div>

      <div className="space-y-12">
        {pageLoading ? <Card className="glass-card border-white/5"><CardContent className="pt-6"><LoadingSkeleton /></CardContent></Card> : (
            isGroupMode ? (
                groupKeys.length > 0 ? groupKeys.map((key, idx) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="glass-card border-white/5 overflow-hidden shadow-2xl">
                            <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                                <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                    <div className="w-2 h-6 bg-accent rounded-full" />
                                    Group {key}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <StandingsTable 
                                    standings={standingsData.groups[key]} 
                                    isAdmin={isAdmin} 
                                    onEditClick={handleEditClick} 
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                )) : (
                    <Card className="glass-card border-white/5"><CardContent><p className="text-muted-foreground text-center py-20 font-bold uppercase tracking-widest text-xs opacity-30">No groups configured.</p></CardContent></Card>
                )
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="glass-card border-white/5 overflow-hidden shadow-2xl">
                        <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <div className="w-2 h-6 bg-accent rounded-full" />
                                Global Leaderboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {standingsData.standalone.length > 0 ? (
                                <StandingsTable 
                                    standings={standingsData.standalone} 
                                    isAdmin={isAdmin} 
                                    onEditClick={handleEditClick} 
                                />
                            ) : (
                                <p className="text-muted-foreground text-center py-20 font-bold uppercase tracking-widest text-xs opacity-30">No teams found for this season.</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )
        )}
      </div>

      {selectedTeam && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="glass-card border-white/5 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Override <span className="text-accent">Stats</span></DialogTitle>
                    <DialogDescription className="text-white/60">Manually adjust performance metrics for {selectedTeam.name}.</DialogDescription>
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
