'use client';
import { useState, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Player, Team, TeamStats, Match } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { PlusCircle, Edit, Pencil, History, TrendingUp, ShieldCheck } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl, cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AthleteCardDialog } from '@/components/players/athlete-card-dialog';

const playerEditSchema = z.object({
  age: z.coerce.number().min(1, 'Age is required'),
  preferredPosition: z.string().min(1, 'Position is required'),
  goals: z.coerce.number().min(0),
  assists: z.coerce.number().min(0),
  matchesPlayed: z.coerce.number().min(0),
});

const teamStatsSchema = z.object({
  matchesPlayed: z.coerce.number().min(0),
  matchesWon: z.coerce.number().min(0),
  matchesDrawn: z.coerce.number().min(0),
  matchesLost: z.coerce.number().min(0),
  totalGoals: z.coerce.number().min(0),
  goalsAgainst: z.coerce.number().min(0),
  totalAssists: z.coerce.number().min(0),
  totalYellowCards: z.coerce.number().min(0),
  totalRedCards: z.coerce.number().min(0),
});

function PlayerEditForm({
  player,
  onSubmit,
  onClose,
}: {
  player: Player;
  onSubmit: (data: z.infer<typeof playerEditSchema>) => void;
  onClose: () => void;
}) {
  const form = useForm<z.infer<typeof playerEditSchema>>({
    resolver: zodResolver(playerEditSchema),
    defaultValues: {
      age: player.age || 0,
      preferredPosition: player.preferredPosition?.join(', ') || '',
      goals: player.goals || 0,
      assists: player.assists || 0,
      matchesPlayed: player.matchesPlayed || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="age" render={({ field }) => (
          <FormItem>
            <FormLabel>Age</FormLabel>
            <FormControl><Input type="number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="preferredPosition" render={({ field }) => (
          <FormItem>
            <FormLabel>Position</FormLabel>
            <FormControl><Input placeholder="e.g. Forward, Midfielder" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="matchesPlayed" render={({ field }) => (
          <FormItem>
            <FormLabel>Matches Played</FormLabel>
            <FormControl><Input type="number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="goals" render={({ field }) => (
          <FormItem>
            <FormLabel>Goals</FormLabel>
            <FormControl><Input type="number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="assists" render={({ field }) => (
          <FormItem>
            <FormLabel>Assists</FormLabel>
            <FormControl><Input type="number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function TeamStatsEditForm({
  team,
  onSubmit,
  onClose,
}: {
  team: Team;
  onSubmit: (data: z.infer<typeof teamStatsSchema>) => void;
  onClose: () => void;
}) {
  const form = useForm<z.infer<typeof teamStatsSchema>>({
    resolver: zodResolver(teamStatsSchema),
    defaultValues: {
      matchesPlayed: team.stats.matchesPlayed || 0,
      matchesWon: team.stats.matchesWon || 0,
      matchesDrawn: team.stats.matchesDrawn || 0,
      matchesLost: team.stats.matchesLost || 0,
      totalGoals: team.stats.totalGoals || 0,
      goalsAgainst: team.stats.goalsAgainst || 0,
      totalAssists: team.stats.totalAssists || 0,
      totalYellowCards: team.stats.totalYellowCards || 0,
      totalRedCards: team.stats.totalRedCards || 0,
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
          <FormItem><FormLabel>Goals Scored</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="goalsAgainst" render={({ field }) => (
          <FormItem><FormLabel>Goals Conceded</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="totalAssists" render={({ field }) => (
          <FormItem><FormLabel>Total Assists</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="totalYellowCards" render={({ field }) => (
          <FormItem><FormLabel>Yellow Cards</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="totalRedCards" render={({ field }) => (
          <FormItem><FormLabel>Red Cards</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <DialogFooter className="col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function TeamDetailPage() {
  const params = useParams<{ teamId: string }>();
  const { teams, players, matches, loading, updatePlayer, updateTeam } = useData();
  const team = teams.find((t) => t.id === params.teamId);
  const { isAdmin } = useAuth();

  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [viewingAthlete, setViewingAthlete] = useState<Player | null>(null);
  const { toast } = useToast();

  const teamForm = useMemo(() => {
    if (!team) return [];
    return matches
      .filter(m => m.status === 'FINISHED' && (m.homeTeamId === team.id || m.awayTeamId === team.id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(m => {
        const isHome = m.homeTeamId === team.id;
        const score = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
        const opponentScore = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
        if (score > opponentScore) return 'W';
        if (score < opponentScore) return 'L';
        return 'D';
      });
  }, [team, matches]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8"><Skeleton className="h-96 w-full" /></div>
  }

  if (!team) {
    notFound();
  }

  const teamPlayers = players.filter((p) => p.teamId === team.id);
  const logo = getImageUrl(team.logoUrl);

  const handlePlayerEditClick = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    setSelectedPlayer(player);
    setIsPlayerDialogOpen(true);
  }

  const handlePlayerFormSubmit = (data: z.infer<typeof playerEditSchema>) => {
    if (!selectedPlayer || !team) return;

    const goalDelta = (data.goals || 0) - (selectedPlayer.goals || 0);
    const assistDelta = (data.assists || 0) - (selectedPlayer.assists || 0);

    const updatedPlayer: Player = {
      ...selectedPlayer,
      ...data,
      preferredPosition: data.preferredPosition.split(',').map(p => p.trim()),
    };
    updatePlayer(updatedPlayer);

    const updatedTeamStats: TeamStats = {
      ...team.stats,
      totalGoals: (team.stats.totalGoals || 0) + goalDelta,
      totalAssists: (team.stats.totalAssists || 0) + assistDelta,
    }

    const updatedTeam: Team = {
      ...team,
      stats: updatedTeamStats,
    }
    updateTeam(updatedTeam);

    setIsPlayerDialogOpen(false);
    setSelectedPlayer(null);
  }

  const handleStatsFormSubmit = (data: z.infer<typeof teamStatsSchema>) => {
    if (!team) return;

    const totalPlayerGoals = teamPlayers.reduce((acc, p) => acc + (p.goals || 0), 0);
    const totalPlayerAssists = teamPlayers.reduce((acc, p) => acc + (p.assists || 0), 0);

    if (data.totalGoals < totalPlayerGoals) {
      toast({
        variant: "destructive",
        title: "Invalid Goal Count",
        description: `Total goals cannot be less than the sum of player goals (${totalPlayerGoals}).`,
      });
      return;
    }

    if (data.totalAssists < totalPlayerAssists) {
      toast({
        variant: "destructive",
        title: "Invalid Assist Count",
        description: `Total assists cannot be less than the sum of player assists (${totalPlayerAssists}).`,
      });
      return;
    }

    const updatedTeam: Team = {
      ...team,
      stats: {
        ...team.stats,
        ...data,
      }
    };
    updateTeam(updatedTeam);
    setIsStatsDialogOpen(false);
  }


  const PlayerRow = ({ player }: { player: Player }) => {
    const avatar = getImageUrl(player.avatarUrl);
    return (
      <TableRow
        className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
        onClick={() => setViewingAthlete(player)}
      >
        <TableCell>
          <div className="flex items-center gap-3">
            <div className={cn(
              "relative w-10 h-10 rounded-xl overflow-hidden border transition-all duration-300 group-hover:border-accent group-hover:scale-105",
              player.category === 'A' ? "border-accent/40" : "border-white/10"
            )}>
              <Image src={avatar.imageUrl} alt={player.name} fill className="object-cover" />
            </div>
            <div>
              <span className="font-bold uppercase text-xs tracking-tight block">{player.name}</span>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest",
                player.category === 'A' ? "text-accent" : "text-muted-foreground"
              )}>Class {player.category}</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell text-xs opacity-60 font-black">{player.age || 'N/A'}</TableCell>
        <TableCell className="hidden sm:table-cell">
          <div className="flex gap-1 flex-wrap">
            {player.preferredPosition?.map(p => (
              <span key={p} className="text-[8px] font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">{p}</span>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-center font-mono font-bold text-accent">{player.goals || 0}</TableCell>
        <TableCell className="text-center hidden sm:table-cell font-mono font-bold opacity-60">{player.assists || 0}</TableCell>
        {isAdmin && (
          <TableCell className="text-right">
            <Button variant="ghost" size="icon" onClick={(e) => handlePlayerEditClick(e, player)} className="hover:bg-white/10">
              <Pencil className="h-4 w-4" />
            </Button>
          </TableCell>
        )}
      </TableRow>
    );
  };

  const statItems = [
    { label: 'Played', value: team.stats.matchesPlayed ?? 0 },
    { label: 'Won', value: team.stats.matchesWon ?? 0 },
    { label: 'Drawn', value: team.stats.matchesDrawn ?? 0 },
    { label: 'Lost', value: team.stats.matchesLost ?? 0 },
    { label: 'Goals Scored', value: team.stats.totalGoals ?? 0 },
    { label: 'Goals Conceded', value: team.stats.goalsAgainst ?? 0 },
    { label: 'Total Assists', value: team.stats.totalAssists ?? 0 },
    { label: 'Yellow Cards', value: team.stats.totalYellowCards ?? 0 },
    { label: 'Red Cards', value: team.stats.totalRedCards ?? 0 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pt-32">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-16 relative">
        <div className="absolute inset-0 bg-accent/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-accent shadow-2xl shadow-accent/20 shrink-0">
          <Image src={logo.imageUrl} alt={`${team.name} logo`} fill className="object-cover" />
        </div>
        <div className="text-center md:text-left space-y-4">
          <div className="space-y-1">
            <h1 className="text-6xl font-black font-headline italic tracking-tighter uppercase leading-none">{team.name}</h1>
            <p className="text-accent font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="h-4 w-4" /> Establishment Integrity Checked
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Ownership</p>
              <p className="text-sm font-bold">{team.owner}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Squad Roster</p>
              <p className="text-sm font-bold">{teamPlayers.length} Elite Athletes</p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Recent Form</p>
              <div className="flex gap-1.5">
                {teamForm.length > 0 ? teamForm.map((result, i) => (
                  <div key={i} className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-[10px] font-black",
                    result === 'W' ? "bg-green-500/20 text-green-500 border border-green-500/30" :
                      result === 'L' ? "bg-red-500/20 text-red-500 border border-red-500/30" :
                        "bg-muted text-muted-foreground border border-border"
                  )}>
                    {result}
                  </div>
                )) : <span className="text-[10px] font-bold opacity-30 italic">No matches recorded</span>}
              </div>
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="md:ml-auto flex gap-3">
            <Button variant="outline" asChild className="rounded-full bg-white/5 border-white/10 hover:bg-white/10">
              <Link href={`/admin/teams`}>
                <Edit className="mr-2 h-4 w-4" /> Registry
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-accent hover:bg-accent/90">
              <Link href={`/admin/players`}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Athlete
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-accent" />
                <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Elite Roster</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Athlete</TableHead>
                    <TableHead className="hidden md:table-cell h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Age</TableHead>
                    <TableHead className="hidden sm:table-cell h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Position</TableHead>
                    <TableHead className="text-center h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Goals</TableHead>
                    <TableHead className="text-center hidden sm:table-cell h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assists</TableHead>
                    {isAdmin && <TableHead className="text-right h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamPlayers.length > 0 ? teamPlayers.map((player) => <PlayerRow key={player.id} player={player} />) : (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center text-muted-foreground italic text-xs uppercase tracking-widest">No active athletes registered</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-accent" />
                <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Performance Metrics</CardTitle>
              </div>
              {isAdmin && (
                <Button variant="ghost" size="icon" onClick={() => setIsStatsDialogOpen(true)} className="hover:bg-white/10">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4">
                {statItems.map(stat => (
                  <div key={stat.label} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                    <span className="font-mono font-black text-lg text-accent">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedPlayer && (
        <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
          <DialogContent className="glass-card border-white/5">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Modify <span className="text-accent">Athlete</span></DialogTitle>
            </DialogHeader>
            <PlayerEditForm
              player={selectedPlayer}
              onSubmit={handlePlayerFormSubmit}
              onClose={() => setIsPlayerDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {team && (
        <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
          <DialogContent className="glass-card border-white/5 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Override <span className="text-accent">Team Stats</span></DialogTitle>
            </DialogHeader>
            <TeamStatsEditForm
              team={team}
              onSubmit={handleStatsFormSubmit}
              onClose={() => setIsStatsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      <AthleteCardDialog
        player={viewingAthlete}
        team={team}
        isOpen={!!viewingAthlete}
        onClose={() => setViewingAthlete(null)}
      />
    </div>
  );
}
