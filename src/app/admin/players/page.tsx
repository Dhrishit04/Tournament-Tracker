'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Player, Team } from '@/types';
import { useData } from '@/hooks/use-data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, getImageUrl } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const playerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  teamId: z.string().min(1, 'Team is required'),
  category: z.string().min(1, 'Category is required'),
  avatarUrl: z.string().optional(),
});

function PlayerForm({
  onSubmit,
  player,
  onClose,
  teams,
}: {
  onSubmit: (data: z.infer<typeof playerSchema>) => void;
  player?: Player | null;
  onClose: () => void;
  teams: Team[];
}) {
  const form = useForm<z.infer<typeof playerSchema>>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: player?.name || '',
      teamId: player?.teamId || '',
      category: player?.category || 'C',
      avatarUrl: player?.avatarUrl || '',
    },
  });

  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith('data:image')) return url;
    const placeholder = PlaceHolderImages.find(p => p.id === url);
    return placeholder?.imageUrl || null;
  }

  const [preview, setPreview] = useState<string | null>(getPreviewUrl(player?.avatarUrl));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 700 * 1024) {
        form.setError('avatarUrl', { message: 'File size must be less than 700KB' });
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        form.setError('avatarUrl', { message: 'Only PNG and JPEG files are allowed' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        form.setValue('avatarUrl', dataUrl);
        form.clearErrors('avatarUrl');
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-70">Athlete Name</FormLabel>
              <FormControl>
                <Input placeholder="Full legal name" className="glass-card" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="teamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-70">Assigned Club</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select club" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-70">Draft Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">Class A (Elite)</SelectItem>
                    <SelectItem value="B">Class B (Pro)</SelectItem>
                    <SelectItem value="C">Class C (Rookie)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="avatarUrl"
            render={() => (
                <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-widest opacity-70">Profile Visualization</FormLabel>
                <FormControl>
                    <Input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} className="glass-card h-fit py-2" />
                </FormControl>
                {preview && (
                    <div className="relative w-24 h-24 rounded-2xl mt-4 overflow-hidden border-2 border-accent/20">
                        <Image src={preview} alt="Avatar preview" fill className="object-cover"/>
                    </div>
                )}
                <FormMessage />
                </FormItem>
            )}
            />
        <DialogFooter className="pt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-white/5">Cancel</Button>
          <Button type="submit" className="bg-accent hover:bg-accent/90 shadow-[0_0_15px_rgba(255,87,34,0.3)]">Finalize Athlete</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminPlayersPage() {
  const { players, teams, addPlayer, updatePlayer, deletePlayer, loading } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [search, setSearch] = useState('');

  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const getTeamName = (teamId: string) => teams.find((t) => t.id === teamId)?.name || 'Unassigned';

  const handleOpenDialog = (mode: 'add' | 'edit', player?: Player) => {
    setDialogMode(mode);
    setSelectedPlayer(player || null);
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPlayer(null);
  }

  const handleFormSubmit = (data: z.infer<typeof playerSchema>) => {
    if (dialogMode === 'edit' && selectedPlayer) {
      updatePlayer({ ...selectedPlayer, ...data });
    } else {
        const newPlayer: Player = {
            id: `p${Date.now()}`,
            ...data,
            avatarUrl: data.avatarUrl || `player-avatar-${(Math.floor(Math.random() * 4) + 1)}`,
            basePrice: 'N/A',
            preferredPosition: [],
            preferredFoot: 'N/A',
            remarks: [],
            age: 0,
            goals: 0,
            assists: 0,
            matchesPlayed: 0,
            yellowCards: 0,
            redCards: 0,
        }
      addPlayer(newPlayer);
    }
    handleCloseDialog();
  };
  
  const handleDelete = (player: Player) => {
      setPlayerToDelete(player);
  }
  
  const confirmDelete = () => {
      if(playerToDelete) {
          deletePlayer(playerToDelete.id);
          setPlayerToDelete(null);
      }
  }

  if (loading) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-64 opacity-20" />
                <Skeleton className="h-12 w-48 opacity-20" />
            </div>
            <Card className="glass-card border-white/5">
                <CardHeader><Skeleton className="h-6 w-32 opacity-10" /></CardHeader>
                <CardContent><Skeleton className="h-96 w-full opacity-5" /></CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter italic uppercase">Athlete <span className="text-accent">Roster</span></h1>
          <p className="text-muted-foreground font-medium">Manage player registration and club assignments.</p>
        </div>
        <Button onClick={() => handleOpenDialog('add')} className="bg-accent hover:bg-accent/90 shadow-[0_0_20px_rgba(255,87,34,0.3)] px-8 h-12 rounded-full font-bold">
          <PlusCircle className="mr-2 h-5 w-5" /> Deploy New Athlete
        </Button>
      </div>

      <Card className="glass-card border-white/5 overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/5 px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-xl font-bold">Registry</CardTitle>
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input 
                placeholder="Search athlete..." 
                className="pl-10 glass-card bg-background/50" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="px-8 h-14 text-xs font-bold uppercase tracking-widest text-muted-foreground">Athlete Profile</TableHead>
                <TableHead className="h-14 text-xs font-bold uppercase tracking-widest text-muted-foreground">Assigned Club</TableHead>
                <TableHead className="h-14 text-xs font-bold uppercase tracking-widest text-muted-foreground">Draft Class</TableHead>
                <TableHead className="px-8 h-14 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length > 0 ? filteredPlayers.map((player) => {
                const avatar = getImageUrl(player.avatarUrl);
                return (
                  <TableRow key={player.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="px-8 py-4">
                      <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/10 group-hover:border-accent/40 transition-colors">
                            <Image
                                src={avatar.imageUrl}
                                alt={player.name}
                                fill
                                className="object-cover scale-105"
                                data-ai-hint={avatar.imageHint}
                            />
                          </div>
                        <div>
                          <p className="font-bold text-base">{player.name}</p>
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Active Roster</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-xs font-bold border border-white/10 group-hover:border-accent/20 transition-colors">
                        {getTeamName(player.teamId)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          player.category === 'A' ? "bg-accent shadow-[0_0_10px_rgba(255,87,34,0.5)]" : 
                          player.category === 'B' ? "bg-blue-500" : "bg-muted"
                        )} />
                        <span className="font-bold text-sm tracking-wide">Class {player.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('edit', player)} className="hover:bg-white/10 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(player)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-card border-white/5">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Decommission <span className="text-destructive">Athlete</span></AlertDialogTitle>
                                    <AlertDialogDescription className="text-white/70">
                                      This will permanently remove the athlete from the DFPL central registry. This operation cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setPlayerToDelete(null)} className="glass-card border-white/10">Abort</AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Confirm Deletion</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <p className="text-muted-foreground font-medium">No athletes match the current query.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-white/5 p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">
              {dialogMode === 'edit' ? 'Update' : 'Register'} <span className="text-accent">Athlete</span>
            </DialogTitle>
            <DialogDescription className="text-xs opacity-50">Modify athlete profile and draft class assignment.</DialogDescription>
          </DialogHeader>
          <PlayerForm
            onSubmit={handleFormSubmit}
            player={selectedPlayer}
            onClose={handleCloseDialog}
            teams={teams}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
