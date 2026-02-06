'use client';
import { useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Player, Team, TeamStats } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { PlusCircle, Edit, Pencil } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
  const { teams, players, loading, updatePlayer, updateTeam } = useData();
  const team = teams.find((t) => t.id === params.teamId);
  const { isAdmin } = useAuth();
  
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const { toast } = useToast();

  if (loading) {
      return <div className="container mx-auto px-4 py-8"><Skeleton className="h-96 w-full"/></div>
  }

  if (!team) {
    notFound();
  }

  const teamPlayers = players.filter((p) => p.teamId === team.id);
  const logo = getImageUrl(team.logoUrl);

  const handlePlayerEditClick = (player: Player) => {
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
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image src={avatar.imageUrl} alt={player.name} fill className="object-cover" data-ai-hint={avatar.imageHint}/>
            </div>
            <span className="font-medium">{player.name}</span>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">{player.age || 'N/A'}</TableCell>
        <TableCell className="hidden sm:table-cell">{player.preferredPosition?.join(', ')}</TableCell>
        <TableCell className="text-center">{player.goals || 0}</TableCell>
        <TableCell className="text-center hidden sm:table-cell">{player.assists || 0}</TableCell>
        {isAdmin && (
            <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handlePlayerEditClick(player)}>
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
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
              <Image src={logo.imageUrl} alt={`${team.name} logo`} fill className="object-cover" data-ai-hint={logo.imageHint} />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold font-headline">{team.name}</h1>
            <p className="text-lg text-muted-foreground">Owner: {team.owner}</p>
          </div>
          {isAdmin && (
            <div className="ml-auto flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/admin/teams`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Team
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/admin/players`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Player
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead className="hidden md:table-cell">Age</TableHead>
                      <TableHead className="hidden sm:table-cell">Position</TableHead>
                      <TableHead className="text-center">Goals</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">Assists</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamPlayers.map((player) => <PlayerRow key={player.id} player={player} />)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team Statistics</CardTitle>
                {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => setIsStatsDialogOpen(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {statItems.map(stat => (
                    <li key={stat.label} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className="font-semibold">{stat.value}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
        
      {selectedPlayer && (
        <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Player: {selectedPlayer.name}</DialogTitle>
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
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Edit Team Statistics: {team.name}</DialogTitle>
              </DialogHeader>
              <TeamStatsEditForm 
                  team={team}
                  onSubmit={handleStatsFormSubmit}
                  onClose={() => setIsStatsDialogOpen(false)}
              />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
