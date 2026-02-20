'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Clock, Timer } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const matchSchema = z.object({
  homeTeamId: z.string().min(1, 'Home team is required'),
  awayTeamId: z.string().min(1, 'Away team is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['UPCOMING', 'LIVE', 'FINISHED', 'POSTPONED']),
  stage: z.enum(['GROUP_STAGE', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINALS', 'OTHERS']),
  description: z.string().max(150, "Description must be 150 characters or less.").optional(),
  isThirdPlacePlayoff: z.boolean().optional(),
}).refine(data => data.homeTeamId !== data.awayTeamId, {
    message: "Home and away teams cannot be the same.",
    path: ["awayTeamId"],
});

function StageSettings() {
    const { currentSeason, updateMatchConfig, loading: seasonLoading } = useSeason();
    const { teams, loading: dataLoading } = useData();
    const [selectedStageForTiming, setSelectedStageForTiming] = useState<MatchStage | ''>('');

    const loading = seasonLoading || dataLoading;

    if (loading || !currentSeason) return (
      <Card className="mb-6">
        <CardHeader><CardTitle><Skeleton className="h-6 w-48" /></CardTitle></CardHeader>
        <CardContent><Skeleton className="h-10 w-full" /></CardContent>
      </Card>
    )

    const { matchConfig } = currentSeason;

    const handleConfigChange = (key: keyof MatchConfig, value: any) => {
        const newConfig = { ...matchConfig, [key]: value };
        updateMatchConfig(newConfig);
    }

    const handleTimingChange = (type: 'duration' | 'extraTime', value: string) => {
        if (!selectedStageForTiming) return;
        const numVal = parseInt(value) || 0;
        const clampedVal = Math.min(90, Math.max(0, numVal));
        
        const currentTimings = matchConfig.stageTimings || {};
        const stageTiming = currentTimings[selectedStageForTiming] || {};
        
        const newTimings = {
            ...currentTimings,
            [selectedStageForTiming]: {
                ...stageTiming,
                [type]: clampedVal
            }
        };
        
        handleConfigChange('stageTimings', newTimings);
    }
    
    const canEnableQuarters = teams.length >= 16;
    const stages = [
        { id: 'GROUP_STAGE', label: 'Group Stage' },
        { id: 'QUARTER_FINALS', label: 'Quarter-Finals' },
        { id: 'SEMI_FINALS', label: 'Semi-Finals' },
        { id: 'FINALS', label: 'Finals' },
        { id: 'OTHERS', label: 'Others' }
    ];

    const currentTiming = selectedStageForTiming ? (matchConfig.stageTimings?.[selectedStageForTiming] || {}) : null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 glass-card border-white/5">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest opacity-70">App & Stage Visibility</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                        <Switch id="group-stage-switch" checked={matchConfig.showGroupStage} onCheckedChange={(c) => handleConfigChange('showGroupStage', c)} />
                        <Label htmlFor="group-stage-switch" className="text-xs font-bold">Group Stage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="quarters-switch" checked={matchConfig.showQuarterFinals} onCheckedChange={(c) => handleConfigChange('showQuarterFinals', c)} disabled={!canEnableQuarters} />
                        <Label htmlFor="quarters-switch" className={cn("text-xs font-bold", !canEnableQuarters ? 'text-muted-foreground' : '')}>Quarters {!canEnableQuarters && `(Min 16 teams)`}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="others-switch" checked={matchConfig.showOthers} onCheckedChange={(c) => handleConfigChange('showOthers', c)} />
                        <Label htmlFor="others-switch" className="text-xs font-bold">Others</Label>
                    </div>
                    <div className="flex items-center space-x-2 border-l border-white/10 pl-6">
                        <Switch id="venue-switch" checked={matchConfig.showVenue} onCheckedChange={(c) => handleConfigChange('showVenue', c)} />
                        <Label htmlFor="venue-switch" className="text-xs font-bold">Venue Info</Label>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card border-accent/20 bg-accent/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-accent flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Match Timing
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select value={selectedStageForTiming} onValueChange={(v) => setSelectedStageForTiming(v as MatchStage)}>
                        <SelectTrigger className="h-9 text-xs glass-card">
                            <SelectValue placeholder="Select stage to configure" />
                        </SelectTrigger>
                        <SelectContent>
                            {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {selectedStageForTiming && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase opacity-50">Match (m)</Label>
                                <Input 
                                    type="number" 
                                    placeholder="90" 
                                    className="h-8 text-xs glass-card" 
                                    value={currentTiming?.duration || ''} 
                                    onChange={(e) => handleTimingChange('duration', e.target.value)}
                                />
                            </div>
                            {selectedStageForTiming !== 'GROUP_STAGE' && (
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase opacity-50">Extra (m)</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="30" 
                                        className="h-8 text-xs glass-card" 
                                        value={currentTiming?.extraTime || ''}
                                        onChange={(e) => handleTimingChange('extraTime', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function TimingIndicator({ stage }: { stage?: MatchStage }) {
    const { currentSeason } = useSeason();
    if (!stage || !currentSeason?.matchConfig.stageTimings?.[stage]) return null;
    
    const timing = currentSeason.matchConfig.stageTimings[stage];
    if (!timing.duration) return null;

    return (
        <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-tighter bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                <Timer className="h-3 w-3" />
                {timing.duration}m
            </div>
            {timing.extraTime ? (
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-tighter bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                    ET: {timing.extraTime}m
                </div>
            ) : null}
        </div>
    );
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
      date: match ? (match.date instanceof Date ? format(match.date, 'yyyy-MM-dd') : format(new Date(match.date), 'yyyy-MM-dd')) : '',
      status: match?.status || 'UPCOMING',
      stage: match?.stage || 'GROUP_STAGE',
      description: match?.description || '',
      isThirdPlacePlayoff: match?.isThirdPlacePlayoff || false,
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
      // Restriction: Only 2 Semi-Finals and 1 Final per season
      if (!match || (match && match.stage !== data.stage)) {
          if (data.stage === 'SEMI_FINALS') {
              const count = matches.filter(m => m.stage === 'SEMI_FINALS').length;
              if (count >= 2) {
                  form.setError('stage', { message: 'Maximum limit of 2 Semi-Final fixtures reached.' });
                  return;
              }
          }
          if (data.stage === 'FINALS') {
              const count = matches.filter(m => m.stage === 'FINALS').length;
              if (count >= 1) {
                  form.setError('stage', { message: 'The Final fixture is already scheduled.' });
                  return;
              }
          }
      }

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

  const selectedStage = form.watch('stage');

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
                <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="UPCOMING">Upcoming</SelectItem><SelectItem value="FINISHED">Finished</SelectItem><SelectItem value="LIVE">Live</SelectItem><SelectItem value="POSTPONED">Postponed</SelectItem></SelectContent></FormItem>
            )}/>
            <FormField control={form.control} name="stage" render={({ field }) => (
                <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger></FormControl>
                        <SelectContent>{availableStages.map(stage => <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <TimingIndicator stage={selectedStage as MatchStage} />
                    <FormMessage />
                </FormItem>
            )}/>
        </div>
        {selectedStage === 'OTHERS' && (
            <div className="space-y-4 pt-2">
                <FormField control={form.control} name="isThirdPlacePlayoff" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-white/5">
                        <div className="space-y-0.5">
                            <FormLabel>Third Place Playoff</FormLabel>
                            <p className="text-[10px] text-muted-foreground">Enable to show on tournament brackets.</p>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Add a short description for this match..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        )}
        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 sm:pt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">Cancel</Button>
          <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">Save Fixture</Button>
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
                isThirdPlacePlayoff: data.isThirdPlacePlayoff,
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
                isThirdPlacePlayoff: data.isThirdPlacePlayoff,
            };
            addMatch(newMatch);
        }
        handleCloseDialog();
    };

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
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-headline tracking-tighter uppercase italic">Match <span className="text-accent">Fixtures</span></h1>
            <Button onClick={() => handleOpenDialog('add')} className="bg-accent hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Schedule Fixture
            </Button>
        </div>

        <StageSettings />

        <Card className="glass-card border-white/5 overflow-hidden">
            <CardContent className="p-0">
                <Tabs defaultValue={activeStages[0]?.key || (legacyMatches.length > 0 ? 'legacy' : 'GROUP_STAGE')} className="w-full">
                    <div className="bg-white/5 border-b border-white/5 p-2 flex items-center justify-between">
                        <TabsList className="bg-transparent border-none">
                            {activeStages.map(stage => (
                                <TabsTrigger key={stage.key} value={stage.key} className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase tracking-widest text-[10px] h-8">
                                    {stage.label}
                                </TabsTrigger>
                            ))}
                            {legacyMatches.length > 0 && (
                                <TabsTrigger value="legacy" className="text-destructive font-bold uppercase tracking-widest text-[10px] h-8">Hidden</TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    {activeStages.map(stage => {
                        const stageMatches = matches.filter(m => m.stage === stage.key);
                        return (
                            <TabsContent key={stage.key} value={stage.key} className="mt-0">
                                <Table>
                                    <TableHeader className="bg-white/5">
                                        <TableRow className="border-white/5">
                                            <TableHead className="px-8 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kickoff</TableHead>
                                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fixture</TableHead>
                                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol</TableHead>
                                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scoreline</TableHead>
                                            <TableHead className="px-8 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stageMatches.length > 0 ? stageMatches.map((match) => {
                                            const group = getTeamGroup(match.homeTeamId);
                                            return (
                                                <TableRow key={match.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                                    <TableCell className="px-8">
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-xs">{format(new Date(match.date), 'MMM dd')}</p>
                                                            <p className="text-[10px] font-medium opacity-40 uppercase tracking-widest">{match.time}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm">{getTeamName(match.homeTeamId)} <span className="text-[10px] opacity-30 italic mx-1">vs</span> {getTeamName(match.awayTeamId)}</span>
                                                            {currentSeason.matchConfig.isGroupModeActive && match.stage === 'GROUP_STAGE' && group && group !== 'None' && (
                                                                <span className="text-[8px] font-black text-accent uppercase tracking-[0.2em] mt-1">Group {group}</span>
                                                            )}
                                                            {match.stage === 'OTHERS' && match.isThirdPlacePlayoff && (
                                                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">Third Place Playoff</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            {match.isExtraTime && match.status === 'LIVE' && (
                                                                <Badge className="bg-accent text-white text-[8px] h-5 font-black animate-pulse border-none">ET</Badge>
                                                            )}
                                                            <Badge variant="outline" className={cn(
                                                                "text-[9px] font-black tracking-widest uppercase border-white/10 px-2 py-0.5",
                                                                match.status === 'LIVE' ? "bg-red-500/10 text-red-500 border-red-500/20" : ""
                                                            )}>
                                                                {match.status}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {(match.status === 'FINISHED' || match.status === 'LIVE') ? (
                                                            <div className="flex items-center gap-2 font-mono font-black text-sm">
                                                                <span className={cn(match.homeScore! > match.awayScore! ? "text-accent" : "")}>{match.homeScore ?? '0'}</span>
                                                                <span className="opacity-20">-</span>
                                                                <span className={cn(match.awayScore! > match.homeScore! ? "text-accent" : "")}>{match.awayScore ?? '0'}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-bold opacity-20">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-8 text-right">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('edit', match)} className="h-8 w-8 hover:bg-white/10"><Edit className="h-4 w-4" /></Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="glass-card border-white/5">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Erase <span className="text-destructive">Fixture</span></AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-white/70">Permanently delete match records and revert associated performance statistics.</AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Abort</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => {setMatchToDelete(match); confirmDelete();}} className="bg-destructive hover:bg-destructive/90">Erase Match</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }) : (
                                          <TableRow><TableCell colSpan={5} className="text-center h-32 text-muted-foreground italic text-sm">No fixtures scheduled for this phase.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        )
                    })}

                    {legacyMatches.length > 0 && (
                        <TabsContent value="legacy" className="mt-0">
                             <div className="p-6 bg-destructive/5 text-destructive text-xs font-bold flex items-center gap-3 border-b border-destructive/10">
                                <PlusCircle className="h-4 w-4 rotate-45" />
                                These fixtures belong to disabled stages and are hidden from the public dashboard.
                            </div>
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-white/5">
                                        <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original Stage</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Matchup</TableHead>
                                        <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Protocol</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {legacyMatches.map((match) => (
                                        <TableRow key={match.id} className="border-white/5 hover:bg-white/5 group transition-colors">
                                            <TableCell className="px-8"><Badge variant="outline" className="text-[9px] font-black tracking-tighter border-white/10">{match.stage}</Badge></TableCell>
                                            <TableCell className="font-bold text-sm">{getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}</TableCell>
                                            <TableCell className="px-8 text-right">
                                                <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {setMatchToDelete(match); confirmDelete();}}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
            <DialogContent className="w-[95vw] sm:max-w-lg glass-card border-white/5 p-8 max-h-[92vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">
                    {dialogMode === 'edit' ? 'Modify' : 'Schedule'} <span className="text-accent">Fixture</span>
                </DialogTitle>
                <DialogDescription className="text-xs opacity-50">Set match details, kickoff timing, and tournament stage.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 w-full mt-4">
                <div className="pr-2">
                    <MatchForm 
                        onSubmit={handleFormSubmit}
                        match={selectedMatch}
                        onClose={handleCloseDialog}
                        teams={teams}
                        matches={matches}
                    />
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
