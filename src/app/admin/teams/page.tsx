'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, LayoutGrid, Save, AlertCircle, RotateCcw } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Team, MatchConfig } from '@/types';
import { useData } from '@/hooks/use-data';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useSeason } from '@/contexts/season-context';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  owner: z.string().min(1, 'Owner name is required'),
  logoUrl: z.string().optional(),
});

function TeamForm({
    onSubmit,
    team,
    onClose,
}: {
    onSubmit: (data: z.infer<typeof teamSchema>) => void;
    team?: Team | null;
    onClose: () => void;
}) {
  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name || '',
      owner: team?.owner || '',
      logoUrl: team?.logoUrl || '',
    },
  });

  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith('data:image')) return url;
    const placeholder = PlaceHolderImages.find(p => p.id === url);
    return placeholder?.imageUrl || null;
  }

  const [preview, setPreview] = useState<string | null>(getPreviewUrl(team?.logoUrl));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 700 * 1024) {
        form.setError('logoUrl', { message: 'File size must be less than 700KB' });
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        form.setError('logoUrl', { message: 'Only PNG and JPEG files are allowed' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        form.setValue('logoUrl', dataUrl);
        form.clearErrors('logoUrl');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                    <Input placeholder="Warriors FC" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Owner</FormLabel>
                <FormControl>
                    <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Team Logo</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                  </FormControl>
                  {preview && (
                    <div className="relative w-20 h-20 rounded-full mt-2 overflow-hidden border border-accent/20">
                        <Image src={preview} alt="Logo preview" fill className="object-cover"/>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Team</Button>
            </DialogFooter>
        </form>
    </Form>
  );
}

function GroupManager({ teams, updateTeam }: { teams: Team[], updateTeam: (team: Team) => void }) {
    const { currentSeason, updateMatchConfig } = useSeason();
    const { resetGroups } = useData();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [pendingGroups, setPendingGroups] = useState<Record<string, string>>({});

    const numGroups = Math.floor(teams.length / 4);
    const canEnableGroupMode = teams.length >= 8 && teams.length % 4 === 0;
    const availableGroups = useMemo(() => Array.from({ length: numGroups }, (_, i) => String.fromCharCode(65 + i)), [numGroups]);

    useEffect(() => {
        const initial: Record<string, string> = {};
        teams.forEach(t => { 
            initial[t.id] = (t.group && t.group !== 'None') ? t.group : 'None'; 
        });
        setPendingGroups(initial);
    }, [teams, isDialogOpen]);

    const handleToggleMode = (checked: boolean) => {
        if (!currentSeason) return;

        if (checked) {
            const unassignedTeams = teams.filter(t => !t.group || t.group === 'None');
            const groupCounts: Record<string, number> = {};
            teams.forEach(t => { 
                if (t.group && t.group !== 'None') {
                    groupCounts[t.group] = (groupCounts[t.group] || 0) + 1;
                }
            });
            
            const allBalanced = availableGroups.every(g => groupCounts[g] === 4);
            
            if (unassignedTeams.length > 0 || !allBalanced) {
                const unassignedNames = unassignedTeams.map(t => t.name).join(', ');
                toast({
                    variant: 'destructive',
                    title: 'Groups Not Balanced',
                    description: `Please assign exactly 4 teams to each group using the "Assign Teams" button before enabling Group Mode.${unassignedNames ? `\n\nReference (Unassigned): ${unassignedNames}` : ''}`,
                });
                return;
            }
        }

        updateMatchConfig({ ...currentSeason.matchConfig, isGroupModeActive: checked });
    };

    const handleSaveGroups = async () => {
        const groupCounts: Record<string, number> = {};
        const unassignedTeamIds = Object.keys(pendingGroups).filter(id => pendingGroups[id] === 'None');

        Object.values(pendingGroups).forEach(g => {
            if (g !== 'None') {
                groupCounts[g] = (groupCounts[g] || 0) + 1;
            }
        });

        const invalidGroups = availableGroups.filter(g => (groupCounts[g] || 0) !== 4);

        if (invalidGroups.length > 0 || unassignedTeamIds.length > 0) {
            const unassignedNames = unassignedTeamIds
                .map(id => teams.find(t => t.id === id)?.name)
                .filter(Boolean)
                .join(', ');

            toast({
                variant: 'destructive',
                title: 'Invalid Group Configuration',
                description: `Each group must have exactly 4 teams. ${invalidGroups.length > 0 ? `Check groups: ${invalidGroups.join(', ')}.` : ''}${unassignedNames ? `\n\nReference (Unassigned): ${unassignedNames}` : ''}`,
            });
            return;
        }

        for (const team of teams) {
            const newGroup = pendingGroups[team.id];
            if (team.group !== newGroup) {
                updateTeam({ ...team, group: newGroup === 'None' ? undefined : newGroup });
            }
        }

        setIsDialogOpen(false);
        toast({ title: 'Groups Updated', description: 'All team group assignments have been saved.' });
    };

    const handleResetAllGroups = async () => {
        if (!currentSeason) return;
        await resetGroups();
        await updateMatchConfig({ ...currentSeason.matchConfig, isGroupModeActive: false });
        setIsResetDialogOpen(false);
    }

    if (!currentSeason) return null;

    return (
        <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2"><LayoutGrid className="h-5 w-5" /> Group Management</CardTitle>
                        <CardDescription className="text-xs">Configure league groups (exactly 4 teams per group)</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch 
                            id="group-mode-toggle" 
                            checked={currentSeason.matchConfig.isGroupModeActive} 
                            onCheckedChange={handleToggleMode}
                            disabled={!canEnableGroupMode && !currentSeason.matchConfig.isGroupModeActive}
                        />
                        <Label htmlFor="group-mode-toggle" className="text-xs font-bold uppercase">Enable Group Mode</Label>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!canEnableGroupMode && !currentSeason.matchConfig.isGroupModeActive ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-md border">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs">Group mode requires a multiple of 4 teams (min 8). Current teams: {teams.length}</span>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-xs font-bold uppercase">
                            Status: <span className={currentSeason.matchConfig.isGroupModeActive ? 'text-primary' : 'text-muted-foreground'}>
                                {currentSeason.matchConfig.isGroupModeActive ? `${numGroups} Groups Active (A-${availableGroups[availableGroups.length-1]})` : 'Inactive (Standalone Mode)'}
                            </span>
                        </div>
                        {canEnableGroupMode && (
                            <div className="flex flex-wrap items-center gap-2">
                                <Button size="sm" onClick={() => setIsDialogOpen(true)} className="h-8 text-[10px] font-black uppercase tracking-widest"><Edit className="h-3 w-3 mr-2" /> Assign Teams</Button>
                                <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive hover:text-destructive-foreground"><RotateCcw className="h-3 w-3 mr-2" /> Reset Groups</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="glass-card">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Reset all groups?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will shift from Group mode to standalone mode and set all teams to unassigned (None).
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleResetAllGroups}>Yes, Reset Groups</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden glass-card border-white/5">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Assign <span className="text-accent">Groups</span></DialogTitle>
                            <DialogDescription className="text-xs">
                                Every group must contain exactly 4 teams. Total groups possible: {numGroups}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
                            <div className="space-y-4 py-4">
                                {teams.map(team => (
                                    <div key={team.id} className="flex items-center justify-between p-3 border border-white/5 rounded-xl bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10">
                                                <Image src={getImageUrl(team.logoUrl).imageUrl} alt={team.name} fill className="object-cover" />
                                            </div>
                                            <span className="font-bold text-sm truncate max-w-[120px] sm:max-w-none">{team.name}</span>
                                        </div>
                                        <Select 
                                            value={pendingGroups[team.id] || 'None'} 
                                            onValueChange={(val) => setPendingGroups(prev => ({ ...prev, [team.id]: val }))}
                                        >
                                            <SelectTrigger className="w-28 sm:w-32 h-9 text-xs glass-card">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                {availableGroups.map(g => (
                                                    <SelectItem key={g} value={g}>Group {g}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter className="p-6 pt-2 border-t border-white/5 mt-auto bg-background/50">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-10 text-[10px] font-black uppercase tracking-widest">Cancel</Button>
                            <Button onClick={handleSaveGroups} className="bg-accent hover:bg-accent/90 h-10 text-[10px] font-black uppercase tracking-widest"><Save className="h-3 w-3 mr-2" /> Save All Assignments</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

export default function AdminTeamsPage() {
    const { teams, addTeam, updateTeam, deleteTeam, loading } = useData();
    const { currentSeason, updateMatchConfig } = useSeason();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
    const [showViolationDialog, setShowViolationDialog] = useState(false);

    useEffect(() => {
        if (!loading && currentSeason?.matchConfig.isGroupModeActive) {
            const totalTeams = teams.length;
            const isValidCount = totalTeams >= 8 && totalTeams % 4 === 0;

            const groupCounts: Record<string, number> = {};
            teams.forEach(t => {
                if (t.group && t.group !== 'None') {
                    groupCounts[t.group] = (groupCounts[t.group] || 0) + 1;
                }
            });
            
            const expectedNumGroups = totalTeams / 4;
            const activeGroupKeys = Object.keys(groupCounts).filter(k => groupCounts[k] > 0);
            
            const allGroupsValid = activeGroupKeys.length === expectedNumGroups && activeGroupKeys.every(k => groupCounts[k] === 4);

            if (!isValidCount || !allGroupsValid) {
                updateMatchConfig({ ...currentSeason.matchConfig, isGroupModeActive: false });
                setShowViolationDialog(true);
            }
        }
    }, [teams, currentSeason?.matchConfig.isGroupModeActive, loading, updateMatchConfig]);

    const handleOpenDialog = (mode: 'add' | 'edit', team?: Team) => {
        setDialogMode(mode);
        setSelectedTeam(team || null);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedTeam(null);
    }

    const handleFormSubmit = (data: z.infer<typeof teamSchema>) => {
        if (dialogMode === 'edit' && selectedTeam) {
            updateTeam({ ...selectedTeam, ...data });
        } else {
            const newTeam: Team = {
                id: `t${Date.now()}`,
                ...data,
                logoUrl: data.logoUrl || `team-logo-${(Math.floor(Math.random() * 4) + 1)}`,
                group: 'None',
                players: [],
                stats: { totalGoals: 0, totalAssists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, matchesDrawn: 0, totalYellowCards: 0, totalRedCards: 0, goalsAgainst: 0 },
            }
            addTeam(newTeam);
        }
        handleCloseDialog();
    };

    const confirmDelete = () => {
        if(teamToDelete) {
            deleteTeam(teamToDelete.id);
            setTeamToDelete(null);
        }
    }

  if (loading) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-32 w-full mb-6" />
            <Card>
                <CardHeader><CardTitle><Skeleton className="h-6 w-48" /></CardTitle></CardHeader>
                <CardContent>
                    <Skeleton className="h-96 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <h1 className="text-4xl font-black font-headline tracking-tighter italic uppercase">Club <span className="text-accent">Operations</span></h1>
            <Button onClick={() => handleOpenDialog('add')} className="bg-accent hover:bg-accent/90 shadow-lg text-accent-foreground font-bold">
            <PlusCircle className="mr-2 h-4 w-4" /> Deploy New Club
            </Button>
        </div>
        
        <GroupManager teams={teams} updateTeam={updateTeam} />

        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-xl font-bold">Club Registry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                        <TableHead className="px-8 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity</TableHead>
                        <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Proprietor</TableHead>
                        <TableHead className="px-8 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teams.map((team) => {
                        const logo = getImageUrl(team.logoUrl);
                        return (
                        <TableRow key={team.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                            <TableCell className="px-8 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 group-hover:border-accent/40 transition-colors">
                                        <Image src={logo.imageUrl} alt={team.name} fill className="object-cover" data-ai-hint={logo.imageHint} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm tracking-tight">{team.name}</span>
                                        {team.group && team.group !== 'None' && <span className="text-[8px] font-black text-accent uppercase tracking-widest">Group {team.group}</span>}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium text-xs opacity-70">{team.owner}</TableCell>
                            <TableCell className="px-8 py-4 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('edit', team)} className="h-8 w-8 hover:bg-white/10">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setTeamToDelete(team)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="glass-card border-white/5">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Decommission <span className="text-destructive">Club</span></AlertDialogTitle>
                                                <AlertDialogDescription className="text-white/70">This will permanently remove the club from the DFPL infrastructure. This operation is irreversible.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setTeamToDelete(null)}>Abort</AlertDialogCancel>
                                                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Confirm Termination</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="w-[95vw] sm:max-w-[450px] max-h-[92vh] flex flex-col p-0 overflow-hidden glass-card border-white/5">
                <DialogHeader className="p-8 pb-2 flex-shrink-0">
                <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">{dialogMode === 'edit' ? 'Modify' : 'Deploy'} <span className="text-accent">Club</span></DialogTitle>
                <DialogDescription className="text-xs opacity-50">Enter the club details and upload a primary identity logo.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 px-8 pb-8 custom-scrollbar overflow-y-auto">
                    <TeamForm 
                        onSubmit={handleFormSubmit}
                        team={selectedTeam}
                        onClose={handleCloseDialog}
                    />
                </div>
            </DialogContent>
      </Dialog>

      <AlertDialog open={showViolationDialog} onOpenChange={setShowViolationDialog}>
        <AlertDialogContent className="glass-card border-white/5">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-destructive">Protocol <span className="text-white">Violation</span></AlertDialogTitle>
                <AlertDialogDescription className="text-white/70">
                    The group mode requirement (exactly 4 teams per group) is no longer satisfied due to recent changes in the team list. The tournament has defaulted to Standalone Standings.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowViolationDialog(false)} className="bg-accent hover:bg-accent/90">Acknowledge</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}