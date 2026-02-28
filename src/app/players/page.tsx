'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, User } from 'lucide-react';
import type { Player } from '@/types';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl, cn } from '@/lib/utils';
import { AthleteCardDialog } from '@/components/players/athlete-card-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeason } from '@/contexts/season-context';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function PlayersPage() {
  const { players, teams, loading } = useData();
  const { currentSeason } = useSeason();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === 'all' || player.teamId === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'N/A';

  const PlayerRow = ({ player }: { player: Player }) => {
    const avatar = getImageUrl(player.avatarUrl);
    return (
      <motion.tr
        variants={itemVariants}
        className="cursor-pointer hover:bg-accent/5 transition-colors group border-b border-white/5"
        onClick={() => setSelectedPlayer(player)}
      >
        <TableCell className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/10 group-hover:border-accent/40 transition-all duration-500 shrink-0 group-hover:scale-105">
              <Image src={avatar.imageUrl} alt={player.name} fill className="object-cover" data-ai-hint={avatar.imageHint} />
            </div>
            <div>
              <div className="font-bold text-base uppercase tracking-tight whitespace-nowrap">{player.name}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap group-hover:text-accent transition-colors">{getTeamName(player.teamId)}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              player.category === 'A' ? "bg-accent shadow-[0_0_10px_rgba(255,87,34,0.5)]" :
                player.category === 'B' ? "bg-blue-500" : "bg-slate-500"
            )} />
            <span className="font-bold text-xs">Class {player.category}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex gap-1 flex-wrap max-w-[150px]">
            {player.preferredPosition?.map(pos => (
              <span key={pos} className="text-[8px] font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">{pos}</span>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-center font-mono font-bold text-sm opacity-60">{player.matchesPlayed}</TableCell>
        <TableCell className="text-center font-mono font-black text-base text-accent">{player.goals}</TableCell>
        <TableCell className="text-center font-mono font-black text-base text-blue-400">{player.assists}</TableCell>
      </motion.tr>
    );
  }

  const LoadingSkeleton = () => (
    <div className="overflow-x-auto custom-scrollbar">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5">
            <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Athlete Profile</TableHead>
            <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Class</TableHead>
            <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Position</TableHead>
            <TableHead className="text-center h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">MP</TableHead>
            <TableHead className="text-center h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">GF</TableHead>
            <TableHead className="text-center h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">AST</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i} className="border-white/5">
              <TableCell className="px-6"><div className='flex items-center gap-4'><Skeleton className="h-12 w-12 rounded-2xl opacity-10" /><Skeleton className="h-5 w-32 opacity-5" /></div></TableCell>
              <TableCell><Skeleton className="h-5 w-12 opacity-5" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24 opacity-5" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto opacity-5" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto opacity-5" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto opacity-5" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-24 max-w-6xl relative z-10 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Athlete <span className="text-gradient-purple">Directory</span></h1>
          <p className="text-muted-foreground text-lg">Official DFPL central registry and performance records.</p>
          <div className="mt-6 inline-flex items-center rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold tracking-widest uppercase text-accent border border-accent/20">
            {currentSeason ? `${currentSeason.name} • 2026` : 'CONNECTING...'}
          </div>
        </div>
        {isAdmin && (
          <Button asChild className="bg-accent hover:bg-accent/90 shadow-lg px-8 h-12 rounded-full font-bold transition-all hover:scale-105">
            <Link href="/admin/players">
              <PlusCircle className="mr-2 h-5 w-5" /> Manage Roster
            </Link>
          </Button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 px-8 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-2xl text-accent"><User className="h-6 w-6" /></div>
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Elite Registry</CardTitle>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative group w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <Input
                    placeholder="Filter by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass-card bg-background/50 h-11 focus:ring-accent/20"
                  />
                </div>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="w-full sm:w-[200px] glass-card bg-background/50 h-11">
                    <SelectValue placeholder="Club Alliance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Global Roster</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <LoadingSkeleton /> : (
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Athlete Profile</TableHead>
                      <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Draft Class</TableHead>
                      <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Positions</TableHead>
                      <TableHead className="text-center h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Played</TableHead>
                      <TableHead className="text-center h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Goals</TableHead>
                      <TableHead className="text-center h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assists</TableHead>
                    </TableRow>
                  </TableHeader>
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player) => <PlayerRow key={player.id} player={player} />)
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-64 text-muted-foreground font-medium italic uppercase tracking-widest text-xs">
                          No intelligence found for current query.
                        </TableCell>
                      </TableRow>
                    )}
                  </motion.tbody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AthleteCardDialog
        player={selectedPlayer}
        team={teams.find(t => t.id === selectedPlayer?.teamId)}
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
}
