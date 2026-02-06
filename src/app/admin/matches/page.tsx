'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Match, Team, MatchStage, MatchConfig } from '@/types';
import { useData } from '@/hooks/use-data';
import { useSeason } from '@/contexts/season-context';
import { Skeleton } from '@/components/ui/skeleton';

const matchSchema = z.object({
  homeTeamId: z.string().min(1, 'Home team is required'),
  awayTeamId: z.string().min(1, 'Away team is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['UPCOMING', 'LIVE', 'FINISHED', 'POSTPONED']),
  stage: z.enum(['GROUP_STAGE', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINALS', 'OTHERS']),
  description: z.string().max(150, "Description must be 150 characters or less.").optional(),
}).refine(data => data.homeTeamId !== data.awayTeamId, {
    message: "Home and away teams cannot be the same.",
    path: ["awayTeamId"],
});

function StageSettings() {
    const { currentSeason, updateMatchConfig, loading: seasonLoading } = useSeason();
    const { teams, loading: dataLoading } = useData();

    const loading = seasonLoading || dataLoading;

    if (loading || !currentSeason) return (
      <Card className="mb-6">
        <CardHeader><CardTitle><Skeleton className="h-6 w-48" /></CardTitle></CardHeader>
        <CardContent><Skeleton className="h-10 w-full" /></CardContent>
      </Card>
    )

    const { matchConfig } = currentSeason;

    const handleConfigChange = (key: keyof MatchConfig, value: boolean) => {
        const newConfig = { ...matchConfig, [key]: value };
        updateMatchConfig(newConfig);
    }
    
    const canEnableQuarters = teams.length >= 16;

    return (
        <Card className="mb-6">
            <CardHeader><CardTitle>Match Stage & App Settings</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                    <Switch id="group-stage-switch" checked={matchConfig.showGroupStage} onCheckedChange={(c) => handleConfigChange('showGroupStage', c)} />
                    <Label htmlFor="group-stage-switch">Show Group Stage</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="quarters-switch" checked={matchConfig.showQuarterFinals} onCheckedChange={(c) => handleConfigChange('showQuarterFinals', c)} disabled={!canEnableQuarters} />
                    <Label htmlFor="quarters-switch" className={!canEnableQuarters ? 'text-muted-foreground' : ''}>Show Quarter-Finals {!canEnableQuarters && `(Needs 16 teams)`}</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="others-switch" checked={matchConfig.showOthers} onCheckedChange={(c) => handleConfigChange('showOthers', c)} />
                    <Label htmlFor="others-switch">Show Others</Label>
                </div>
                <div className="flex items-center space-x-2 border-l pl-6">
                    <Switch id="venue-switch" checked={matchConfig.showVenue} onCheckedChange={(c) => handleConfigChange('showVenue', c)} />
                    <Label htmlFor="venue-switch">Display Venue Info</Label>
                </div>
            </CardContent>
        </Card>
    )
}

function MatchForm({
  onSubmit,
  match,
  onClose,
  teams,
  matches,
}: {
  onSubmit: (data: z.infer<typeof matchSchema>) => void;
  match?: Match | null;
  onClose: () => void;
  teams: Team[];
  matches: Match[];
}) {
  const { currentSeason } = useSeason();

  const form = useForm<z.infer<typeof matchSchema>>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      homeTeamId: match?.homeTeamId || '',
      awayTeamId: match?.awayTeamId || '',
      date: match ? format(new Date(match.date), 'yyyy-MM-dd') : '',
      status: match?.status || 'UPCOMING',
      stage: match?.stage || 'GROUP_STAGE',
      description: match?.description || '',
    },
  });

  const availableStages = useMemo(() => {
    if (!currentSeason) return [];
    
    let stages: { value: MatchStage; label: string }[] = [];
    if (currentSeason.matchConfig.showGroupStage) {
      stages.push({ value: 'GROUP_STAGE', label: 'Group Stage' });
    }
    if (currentSeason.matchConfig.showQuarterFinals && teams.length >= 16) {
        stages.push({ value: 'QUARTER_FINALS', label: 'Quarter-Finals' });
    }
    stages.push({ value: 'SEMI_FINALS', label: 'Semi-Finals' });
    stages.push({ value: 'FINALS', label: 'Finals' });
    if (currentSeason.matchConfig.showOthers) {
        stages.push({ value: 'OTHERS', label: 'Others' });
    }
    
    return stages;
  }, [currentSeason, teams.length]);

  const handleValidationAndSubmit = (data: z.infer<typeof matchSchema>) => {
      if (data.stage === 'GROUP_STAGE' && currentSeason?.matchConfig.isGroupModeActive) {
          const homeTeam = teams.find(t => t.id === data.homeTeamId);
          const awayTeam = teams.find(t => t.id === data.awayTeamId);
          if (homeTeam?.group !== awayTeam?.group) {
              form.setError('awayTeamId', { 
                  message: `In Group Stage, teams must be from the same group. Home: Group ${homeTeam?.group || 'N/A'}, Away: Group ${awayTeam?.group || 'N/A'}` 
              });
              return;
          }
      }
      onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleValidationAndSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="homeTeamId" render={({ field }) => (
                <FormItem><FormLabel>Home Team</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select home team" /></SelectTrigger></FormControl><SelectContent>{teams.map((team) => (<SelectItem key={team.id} value={team.id}>{team.name} {team.group && team.group !== 'None' ? `(Group ${team.group})` : ''}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="awayTeamId" render={({ field }) => (
                <FormItem><FormLabel>Away Team</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select away team" /></SelectTrigger></FormControl><SelectContent>{teams.map((team) => (<SelectItem key={team.id} value={team.id}>{team.name} {team.group && team.group !== 'None' ? `(Group ${team.group})` : ''}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="UPCOMING">Upcoming</SelectItem><SelectItem value="FINISHED">Finished</SelectItem><SelectItem value="LIVE">Live</SelectItem><SelectItem value="POSTPONED">Postponed</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="stage" render={({ field }) => (
                <FormItem><FormLabel>Stage</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger></FormControl><SelectContent>{availableStages.map(stage => <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )}/>
        </div>
        {form.watch('stage') === 'OTHERS' && (
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Add a short description for this match..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Match</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


export default function AdminMatchesPage() {
    const { matches, teams, addMatch, updateMatch, deleteMatch, loading } = useData();
    const { currentSeason, loading: seasonLoading } = useSeason();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

    const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || '...';
    const getTeamGroup = (teamId: string) => teams.find(t => t.id === teamId)?.group;

    const handleOpenDialog = (mode: 'add' | 'edit', match?: Match) => {
        setDialogMode(mode);
        setSelectedMatch(match || null);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedMatch(null);
    }

    const handleFormSubmit = async (data: z.infer<typeof matchSchema>) => {
        if (dialogMode === 'edit' && selectedMatch) {
            const updatedMatchData: Match = {
                ...selectedMatch,
                homeTeamId: data.homeTeamId,
                awayTeamId: data.awayTeamId,
                date: parseISO(data.date),
                status: data.status,
                stage: data.stage,
                description: data.description,
            };
            updateMatch(updatedMatchData);
        } else {
            const newMatch: Match = {
                id: `m${Date.now()}`,
                homeTeamId: data.homeTeamId,
                awayTeamId: data.awayTeamId,
                date: parseISO(data.date),
                status: data.status,
                time: new Date(parseISO(data.date)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                venue: 'TBD',
                events: [],
                homeScore: 0,
                awayScore: 0,
                stage: data.stage,
                description: data.description,
            };
            addMatch(newMatch);
        }
        handleCloseDialog();
    };

    const handleDelete = (match: Match) => {
        setMatchToDelete(match);
    }

    const confirmDelete = () => {
        if(matchToDelete) {
            deleteMatch(matchToDelete.id);
            setMatchToDelete(null);
        }
    }
  
  const pageLoading = loading || seasonLoading || !currentSeason;

  const STAGES: { key: MatchStage, label: string, show: boolean | undefined }[] = [
      { key: 'GROUP_STAGE', label: 'Group Stage', show: currentSeason?.matchConfig.showGroupStage },
      { key: 'QUARTER_FINALS', label: 'Quarter-Finals', show: currentSeason?.matchConfig.showQuarterFinals && teams.length >= 16 },
      { key: 'SEMI_FINALS', label: 'Semi-Finals', show: true },
      { key: 'FINALS', label: 'Finals', show: true },
      { key: 'OTHERS', label: 'Others', show: currentSeason?.matchConfig.showOthers },
  ];

  const activeStages = STAGES.filter(s => s.show);
  
  // Find matches that don't fit into current active stages (ghost matches)
  const legacyMatches = matches.filter(m => !activeStages.some(s => s.key === m.stage));

  if (pageLoading) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-48 w-full mb-6" />
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
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold font-headline">Manage Matches</h1>
            <Button onClick={() => handleOpenDialog('add')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Match
            </Button>
        </div>
        <StageSettings />
        <Card>
            <CardContent className="p-0">
                <Tabs defaultValue={activeStages[0]?.key || (legacyMatches.length > 0 ? 'legacy' : 'GROUP_STAGE')} className="w-full">
                    <TabsList className="m-4">
                        {activeStages.map(stage => (
                            <TabsTrigger key={stage.key} value={stage.key}>{stage.label}</TabsTrigger>
                        ))}
                        {legacyMatches.length > 0 && (
                             <TabsTrigger value="legacy" className="text-destructive font-bold">Hidden/Legacy</TabsTrigger>
                        )}
                    </TabsList>

                    {activeStages.map(stage => {
                        const stageMatches = matches.filter(m => m.stage === stage.key);
                        return (
                            <TabsContent key={stage.key} value={stage.key} className="p-4 pt-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Match</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stageMatches.length > 0 ? stageMatches.map((match) => {
                                            const group = getTeamGroup(match.homeTeamId);
                                            return (
                                                <TableRow key={match.id}>
                                                    <TableCell>{format(new Date(match.date), 'PP')}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span>{getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}</span>
                                                            {currentSeason.matchConfig.isGroupModeActive && match.stage === 'GROUP_STAGE' && group && group !== 'None' && (
                                                                <span className="text-[10px] font-bold text-primary uppercase">Group {group}</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell><Badge variant={match.status === 'FINISHED' ? 'secondary' : 'default'} className={match.status === 'UPCOMING' ? 'bg-accent text-accent-foreground' : ''}>{match.status}</Badge></TableCell>
                                                    <TableCell>{(match.status === 'FINISHED' || match.status === 'LIVE') ? `${match.homeScore ?? '0'} - ${match.awayScore ?? '0'}` : '—'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('edit', match)}><Edit className="h-4 w-4" /></Button>
                                                        <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(match)}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the match and revert all associated statistics.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setMatchToDelete(null)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }) : (
                                          <TableRow><TableCell colSpan={5} className="text-center h-24">No matches scheduled for this stage.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        )
                    })}

                    {legacyMatches.length > 0 && (
                        <TabsContent value="legacy" className="p-4 pt-0">
                             <div className="p-4 mb-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                                <strong>Warning:</strong> These matches are not visible on the public site because their stages are disabled or malformed. You should delete them to ensure clean tournament statistics and exports.
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Stage</TableHead>
                                        <TableHead>Match</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {legacyMatches.map((match) => (
                                        <TableRow key={match.id}>
                                            <TableCell><Badge variant="outline">{match.stage}</Badge></TableCell>
                                            <TableCell>{getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(match)}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Permanently delete ghost match?</AlertDialogTitle><AlertDialogDescription>This will revert any goals or cards associated with this match.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setMatchToDelete(null)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    )}
                </Tabs>
            </CardContent>
        </Card>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{dialogMode === 'edit' ? 'Edit Match' : 'Schedule New Match'}</DialogTitle>
                <DialogDescription>{dialogMode === 'edit' ? 'Update the details of the match.' : 'Fill in the details to schedule a new match.'}</DialogDescription>
            </DialogHeader>
            <MatchForm 
                onSubmit={handleFormSubmit}
                match={selectedMatch}
                onClose={handleCloseDialog}
                teams={teams}
                matches={matches}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
