'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Player } from '@/types';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/utils';

export default function PlayersPage() {
  const { players, teams, loading } = useData();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === 'all' || player.teamId === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'N/A';
  
  const PlayerRow = ({ player }: { player: Player }) => {
    const avatar = getImageUrl(player.avatarUrl);
    return (
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image src={avatar.imageUrl} alt={player.name} fill className="object-cover" data-ai-hint={avatar.imageHint} />
            </div>
            <div>
              <div className="font-medium whitespace-nowrap">{player.name}</div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">{getTeamName(player.teamId)}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>{player.category}</TableCell>
        <TableCell className="whitespace-nowrap">{player.preferredPosition?.join(', ')}</TableCell>
        <TableCell className="text-center">{player.matchesPlayed}</TableCell>
        <TableCell className="text-center">{player.goals}</TableCell>
        <TableCell className="text-center">{player.assists}</TableCell>
      </TableRow>
    );
  }

  const LoadingSkeleton = () => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-center">Played</TableHead>
                    <TableHead className="text-center">Goals</TableHead>
                    <TableHead className="text-center">Assists</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><div className='flex items-center gap-3'><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">All Players</h1>
        {isAdmin && (
            <Button asChild variant="outline" className="rounded-full">
                <Link href="/admin/players">
                    <PlusCircle className="mr-2 h-4 w-4" /> Manage Players
                </Link>
            </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Player Directory</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Input
              placeholder="Search by player name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
            {loading ? <LoadingSkeleton/> : (
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-center">Played</TableHead>
                        <TableHead className="text-center">Goals</TableHead>
                        <TableHead className="text-center">Assists</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPlayers.length > 0 ? (
                        filteredPlayers.map((player) => <PlayerRow key={player.id} player={player} />)
                        ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                            No players found.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
