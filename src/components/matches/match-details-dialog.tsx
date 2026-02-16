'use server';

'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type MatchEvent, type Match, type MatchStage } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useData } from '@/hooks/use-data';
import { cn, getImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Goal, Footprints, Trash2, Pencil, CheckCircle2, Settings2, Timer, Sword, AlertTriangle, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSeason } from '@/contexts/season-context';
import { Switch } from '@/components/ui/switch';

const eventSchema = z.object({
  type: z.enum(['Goal', 'Assist', 'Yellow Card', 'Red Card', 'Own Goal']),
  playerId: z.string().min(1, 'Player is required'),
  minute: z.coerce.number().min(1, 'Minute must be at least 1'),
  assisterId: z.string().optional(),
});

const matchSettingsSchema = z.object({
  status: z.enum(['UPCOMING', 'LIVE', 'FINISHED', 'POSTPONED']),
  stage: z.enum(['GROUP_STAGE', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINALS', 'OTHERS']),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().optional(),
  description: z.string().optional(),
  isExtraTime: z.boolean().optional(),
  isThirdPlacePlayoff: z.boolean().optional(),
});

export function MatchDetailsDialog({ matchId, isOpen, onClose }: { matchId: string; isOpen: boolean; onClose: () => void; }) {
    const { isAdmin } = useAuth();
    const { matches, players, teams, addMatchEvent, updateMatchEvent, deleteMatchEvent, updateMatchStatus, updateMatch, deleteMatch, logAction } = useData();
    const { currentSeason } = useSeason();
    const { toast } = useToast();
    
    const match = matches.find(m => m.id === matchId);

    const [showEventForm, setShowEventForm] = useState(false);
    const [showSettingsForm, setShowSettingsForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<MatchEvent | null>(null);
    const [protocolPhase, setProtocolPhase] = useState<'NONE' | 'EXTRA_TIME_CONFIRM'>('NONE');

    const eventForm = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: { type: 'Goal', minute: 1, assisterId: 'none' },
    });

    const settingsForm = useForm<z.infer<typeof matchSettingsSchema>>({
        resolver: zodResolver(matchSettingsSchema),
        defaultValues: {
            status: match?.status || 'UPCOMING',
            stage: match?.stage || 'GROUP_STAGE',
            date: match ? format(new Date(match.date), 'yyyy-MM-dd') : '',
            time: match?.time || '',
            venue: match?.venue || '',
            description: match?.description || '',
            isExtraTime: match?.isExtraTime || false,
            isThirdPlacePlayoff: match?.isThirdPlacePlayoff || false,
        },
    });

    const currentSettingsStage = settingsForm.watch('stage');

    useEffect(() => {
        if (currentSettingsStage === 'GROUP_STAGE') {
            settingsForm.setValue('isExtraTime', false);
        }
    }, [currentSettingsStage, settingsForm]);

    const h2hStats = useMemo(() => {
        if (!match || !teams.length) return null;
        const past = matches.filter(m => 
            m.status === 'FINISHED' && 
            m.id !== match.id &&
            ((m.homeTeamId === match.homeTeamId && m.awayTeamId === match.awayTeamId) ||
             (m.homeTeamId === match.awayTeamId && m.awayTeamId === match.homeTeamId))
        );
        
        let homeWins = 0, awayWins = 0, draws = 0;
        past.forEach(m => {
            const hWin = (m.homeScore ?? 0) > (m.awayScore ?? 0);
            const aWin = (m.awayScore ?? 0) > (m.homeScore ?? 0);
            if (m.homeTeamId === match.homeTeamId) {
                if (hWin) homeWins++; else if (aWin) awayWins++; else draws++;
            } else {
                if (aWin) homeWins++; else if (hWin) awayWins++; else draws++;
            }
        });
        return { homeWins, awayWins, draws, total: past.length };
    }, [match, matches, teams]);

    useEffect(() => {
        if (match) {
            settingsForm.reset({
                status: match.status,
                stage: match.stage,
                date: match.date instanceof Date ? format(match.date, 'yyyy-MM-dd') : format(new Date(match.date), 'yyyy-MM-dd'),
                time: match.time,
                venue: match.venue || '',
                description: match.description || '',
                isExtraTime: match.isExtraTime || false,
                isThirdPlacePlayoff: match.isThirdPlacePlayoff || false,
            });
        }
    }, [match, settingsForm]);

    const availableStages = useMemo(() => {
        if (!currentSeason) return [];
        let stages: { value: MatchStage; label: string }[] = [];
        if (currentSeason.matchConfig.showGroupStage) stages.push({ value: 'GROUP_STAGE', label: 'Group Stage' });
        if (currentSeason.matchConfig.showQuarterFinals && teams.length >= 16) stages.push({ value: 'QUARTER_FINALS', label: 'Quarter-Finals' });
        stages.push({ value: 'SEMI_FINALS', label: 'Semi-Finals' }, { value: 'FINALS', label: 'Finals' });
        if (currentSeason.matchConfig.showOthers) stages.push({ value: 'OTHERS', label: 'Others' });
        return stages;
    }, [currentSeason, teams.length]);

    if (!match) return null;
    
    const homeTeam = teams.find(t => t.id === match.homeTeamId);
    const awayTeam = teams.find(t => t.id === match.awayTeamId);

    if (!homeTeam || !awayTeam) return null;

    const homePlayers = players.filter(p => p.teamId === homeTeam.id);
    const awayPlayers = players.filter(p => p.teamId === awayTeam.id);

    const homeLogo = getImageUrl(homeTeam.logoUrl);
    const awayLogo = getImageUrl(awayTeam.logoUrl);

    const showVenue = currentSeason?.matchConfig.showVenue ?? true;
    const stageTiming = match.stage ? currentSeason?.matchConfig.stageTimings?.[match.stage] : null;
    const baseDuration = stageTiming?.duration || 90;
    const extraDuration = stageTiming?.extraTime || 0;

    const selectedScorerId = eventForm.watch('playerId');
    const selectedScorer = players.find(p => p.id === selectedScorerId);
    const eligibleAssisters = useMemo(() => {
        if (!selectedScorer) return [];
        return players.filter(p => p.teamId === selectedScorer.teamId && p.id !== selectedScorer.id);
    }, [selectedScorer, players]);

    const handleEventSubmit = async (values: z.infer<typeof eventSchema>) => {
        const inputMinute = Number(values.minute);
        const maxAllowedForPhase = match.isExtraTime ? extraDuration : baseDuration;

        if (inputMinute > maxAllowedForPhase) {
            toast({
                variant: 'destructive',
                title: 'Timing Violation',
                description: match.isExtraTime 
                    ? `Extra Time protocol is configured for ${extraDuration}m. Minute must be between 1-${extraDuration}.`
                    : `Regular match duration is capped at ${baseDuration}m.`
            });
            return;
        }

        const actualMinute = match.isExtraTime ? (baseDuration + inputMinute) : inputMinute;

        const { assisterId, ...baseValues } = values;
        const player = players.find(p => p.id === values.playerId);
        if (!player) return;

        if (editingEvent) {
            await updateMatchEvent(match.id, editingEvent.id, { 
                ...baseValues, 
                minute: actualMinute,
                teamId: player.teamId, 
                playerName: player.name,
                assisterId: (assisterId && assisterId !== 'none') ? assisterId : undefined
            });
        } else {
            if (values.type === 'Goal' && assisterId && assisterId !== 'none') {
                const assister = players.find(p => p.id === assisterId);
                if (!assister) return;
                const goalEventId = `evt-${Date.now()}`;
                await addMatchEvent(match.id, { ...baseValues, minute: actualMinute, id: goalEventId, teamId: player.teamId, playerName: player.name });
                await addMatchEvent(match.id, { 
                    type: 'Assist', 
                    minute: actualMinute, 
                    playerId: assister.id, 
                    teamId: assister.teamId, 
                    playerName: assister.name, 
                    linkedGoalId: goalEventId 
                });
            } else {
                await addMatchEvent(match.id, { ...baseValues, minute: actualMinute, id: `evt-${Date.now()}`, teamId: player.teamId, playerName: player.name });
            }
        }
        resetEventForm();
    };

    const handleDeclareMatch = async () => {
        const isDraw = (match.homeScore ?? 0) === (match.awayScore ?? 0);
        const isKnockout = match.stage !== 'GROUP_STAGE';

        if (isDraw && isKnockout && !match.isExtraTime) {
            setProtocolPhase('EXTRA_TIME_CONFIRM');
        } else {
            await updateMatchStatus(match.id, 'FINISHED');
            settingsForm.setValue('status', 'FINISHED');
        }
    };

    const handleConfirmExtraTime = async () => {
        setProtocolPhase('NONE');
        await updateMatch({ ...match, isExtraTime: true });
        logAction("EXTRA_TIME", `Initiated Extra Time protocol for ${homeTeam.name} vs ${awayTeam.name}`);
        toast({ title: 'Extra Time Active', description: 'Match remains LIVE. Record additional events below.' });
    };

    const handleConfirmFinishAsDraw = async () => {
        setProtocolPhase('NONE');
        await updateMatchStatus(match.id, 'FINISHED');
        settingsForm.setValue('status', 'FINISHED');
    };

    const handleSettingsSubmit = async (values: z.infer<typeof matchSettingsSchema>) => {
        const updatedMatch: Match = {
            ...match,
            status: values.status,
            stage: values.stage,
            date: values.date instanceof Date ? values.date : parseISO(values.date),
            time: values.time,
            venue: values.venue,
            description: values.description,
            isExtraTime: values.stage === 'GROUP_STAGE' ? false : values.isExtraTime,
            isThirdPlacePlayoff: values.isThirdPlacePlayoff,
        };
        await updateMatch(updatedMatch);
        setShowSettingsForm(false);
        toast({ title: "Updated", description: "Match details saved successfully." });
    };

    const resetEventForm = () => {
        eventForm.reset({ type: 'Goal', minute: 1, playerId: '', assisterId: 'none' });
        setShowEventForm(false);
        setEditingEvent(null);
    };

    const EventIcon = ({type}: {type: MatchEvent['type']}) => {
        switch(type) {
            case 'Goal': return <Goal className="w-4 h-4 text-green-500"/>
            case 'Assist': return <Footprints className="w-4 h-4 text-blue-500" />
            case 'Own Goal': return <Goal className="w-4 h-4 text-red-500" />
            case 'Yellow Card': return <div className="w-3 h-4 bg-yellow-400 border border-black/20 rounded-sm"/>
            case 'Red Card': return <div className="w-3 h-4 bg-red-600 border border-black/20 rounded-sm"/>
            default: return null
        }
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] flex flex-col p-0 glass-card border-white/5 overflow-hidden">
        {protocolPhase === 'EXTRA_TIME_CONFIRM' ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                    <Timer className="h-10 w-10 text-accent" />
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Match <span className="text-accent">Locked</span></h2>
                <p className="text-white/70 max-w-md mb-8">
                    The fixture has ended in a draw ({match.homeScore}-{match.awayScore}). Since this is a knockout stage, do you want to initiate **Extra Time Protocol** or conclude as a draw?
                </p>
                {extraDuration > 0 && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between w-full max-w-xs mb-8">
                        <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Configured Extra Time</span>
                        <span className="text-sm font-black text-accent">{extraDuration} Minutes</span>
                    </div>
                )}
                <div className="flex gap-4 w-full max-w-sm">
                    <Button onClick={handleConfirmFinishAsDraw} variant="ghost" className="flex-1 h-14 border border-white/10 hover:bg-white/5 uppercase font-black text-[10px] tracking-widest">Conclude Draw</Button>
                    <Button onClick={handleConfirmExtraTime} className="flex-1 h-14 bg-accent hover:bg-accent/90 uppercase font-black text-[10px] tracking-widest shadow-lg shadow-accent/20">Initiate ET</Button>
                </div>
            </div>
        ) : (
            <>
                <DialogHeader className="p-4 md:p-6 pb-0 border-b border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <DialogTitle className="text-xl md:text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">Match <span className="text-accent">Protocol</span></DialogTitle>
                                <Badge variant="outline" className="text-[8px] md:text-[10px] font-black tracking-widest border-white/10 uppercase">{match.stage?.replace('_', ' ')}</Badge>
                                {match.isExtraTime && (
                                    <Badge className="bg-accent text-white border-none text-[8px] md:text-[10px] font-black animate-pulse">EXTRA TIME</Badge>
                                )}
                            </div>
                            <DialogDescription className="font-bold text-[10px] md:text-xs uppercase tracking-widest opacity-50 truncate">{format(new Date(match.date), 'EEEE, MMMM d, yyyy')}</DialogDescription>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-2 self-end md:self-auto md:mr-8 mb-2 md:mb-0">
                                <Button variant="ghost" size="sm" onClick={() => setShowSettingsForm(!showSettingsForm)} className="h-7 md:h-8 rounded-full hover:bg-white/5 border border-white/10 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
                                    <Settings2 className="w-3 h-3 mr-1.5" /> {showSettingsForm ? 'Close' : 'Config'}
                                </Button>
                                <Button variant="destructive" size="sm" className="h-7 md:h-8 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest" onClick={async () => { if(confirm('Delete fixture and revert stats?')) { await deleteMatch(match.id); onClose(); } }}>
                                    <Trash2 className="w-3 h-3 mr-1" /> Decommission
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4 md:p-6">
                    {isAdmin && showSettingsForm && (
                        <Card className="mb-6 bg-white/5 border-white/5 animate-in slide-in-from-top-4 duration-300">
                            <CardHeader className="py-3 px-4"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Administrative Configuration</CardTitle></CardHeader>
                            <CardContent className="px-4 pb-4">
                                <Form {...settingsForm}>
                                    <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            <FormField control={settingsForm.control} name="status" render={({ field }) => (
                                                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-9 text-xs glass-card"><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="UPCOMING">Upcoming</SelectItem><SelectItem value="LIVE">Live</SelectItem><SelectItem value="FINISHED">Finished</SelectItem><SelectItem value="POSTPONED">Postponed</SelectItem></SelectContent></Select></FormItem>
                                            )}/>
                                            <FormField control={settingsForm.control} name="stage" render={({ field }) => (
                                                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Stage</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-9 text-xs glass-card"><SelectValue/></SelectTrigger></FormControl><SelectContent>{availableStages.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></FormItem>
                                            )}/>
                                            {showVenue && (
                                                <FormField control={settingsForm.control} name="venue" render={({ field }) => (
                                                    <FormItem><FormLabel className="text-[10px] font-bold uppercase">Venue</FormLabel><FormControl><Input className="h-9 text-xs glass-card" {...field}/></FormControl></FormItem>
                                                )}/>
                                            )}
                                            <FormField control={settingsForm.control} name="date" render={({ field }) => (
                                                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Date</FormLabel><FormControl><Input type="date" className="h-9 text-xs glass-card" {...field}/></FormControl></FormItem>
                                            )}/>
                                            <FormField control={settingsForm.control} name="time" render={({ field }) => (
                                                <FormItem><FormLabel className="text-[10px] font-bold uppercase">Kickoff</FormLabel><FormControl><Input className="h-9 text-xs glass-card" {...field}/></FormControl></FormItem>
                                            )}/>
                                            {currentSettingsStage !== 'GROUP_STAGE' && (
                                                <FormField control={settingsForm.control} name="isExtraTime" render={({ field }) => (
                                                    <FormItem className="flex flex-col justify-end space-y-2">
                                                        <FormLabel className="text-[10px] font-black uppercase opacity-50">Extra Time Protocol</FormLabel>
                                                        <div className="flex items-center space-x-2 bg-white/5 h-9 rounded-md px-3 border border-white/5">
                                                            <FormControl>
                                                                <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-accent scale-75" />
                                                            </FormControl>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                                                                {field.value ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </FormItem>
                                                )}/>
                                            )}
                                            {settingsForm.watch('stage') === 'OTHERS' && (
                                                <FormField control={settingsForm.control} name="isThirdPlacePlayoff" render={({ field }) => (
                                                    <FormItem className="flex flex-col justify-end space-y-2">
                                                        <FormLabel className="text-[10px] font-black uppercase opacity-50">3rd Place Playoff</FormLabel>
                                                        <div className="flex items-center space-x-2 bg-white/5 h-9 rounded-md px-3 border border-white/5">
                                                            <FormControl>
                                                                <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-blue-500 scale-75" />
                                                            </FormControl>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                                                                {field.value ? 'Bracket' : 'Match'}
                                                            </span>
                                                        </div>
                                                    </FormItem>
                                                )}/>
                                            )}
                                        </div>
                                        <div className="flex justify-end">
                                            <Button type="submit" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest px-6 bg-accent hover:bg-accent/90">Update Registry</Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-6 md:space-y-8">
                            <div className="flex flex-col items-center justify-center bg-white/5 p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden h-fit">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Sword className="h-24 md:h-32 w-24 md:w-32 rotate-12" />
                                </div>
                                
                                <div className="flex items-center justify-around w-full mb-6 md:mb-8 gap-4 relative z-10">
                                    <div className="flex flex-col items-center w-[40%] text-center min-w-0">
                                        <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 md:mb-4 border-2 border-accent/20 shadow-xl shrink-0 group">
                                            <Image src={homeLogo.imageUrl} alt={homeTeam.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <span className="font-black text-[10px] md:text-sm leading-tight truncate w-full uppercase tracking-tighter">{homeTeam.name}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 md:gap-2">
                                        <div className="text-3xl md:text-5xl font-black font-mono tracking-tighter flex items-center gap-2 md:gap-3">
                                            {match.status === 'FINISHED' || match.status === 'LIVE' ? (
                                            <>
                                                <span className={cn(match.homeScore! > match.awayScore! ? "text-accent" : "")}>{match.homeScore ?? 0}</span>
                                                <span className="text-white/10 font-sans">-</span>
                                                <span className={cn(match.awayScore! > match.homeScore! ? "text-accent" : "")}>{match.awayScore ?? 0}</span>
                                            </>
                                            ) : (
                                            <span className="text-sm md:text-xl text-white/40 font-sans font-black uppercase tracking-[0.2em]">{match.time}</span>
                                            )}
                                        </div>
                                        {stageTiming?.duration && (
                                            <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-2.5 py-0.5 md:py-1 rounded-full border border-white/5">
                                                <Timer className="h-2.5 md:h-3 w-2.5 md:w-3" /> {baseDuration}m Base
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center w-[40%] text-center min-w-0">
                                        <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 md:mb-4 border-2 border-accent/20 shadow-xl shrink-0 group">
                                            <Image src={awayLogo.imageUrl} alt={awayTeam.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <span className="font-black text-[10px] md:text-sm leading-tight truncate w-full uppercase tracking-tighter">{awayTeam.name}</span>
                                    </div>
                                </div>

                                {isAdmin && match.status === 'LIVE' && (
                                    <Button onClick={handleDeclareMatch} className="bg-green-600 hover:bg-green-700 w-full font-black italic uppercase tracking-widest h-10 md:h-12 shadow-lg shadow-green-900/20 text-xs">
                                        <CheckCircle2 className="mr-2 h-4 md:h-5 w-4 md:w-5" /> Declare Finished
                                    </Button>
                                )}
                                {match.status === 'FINISHED' && (
                                    <div className="flex items-center gap-2 md:gap-3 text-accent font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] bg-accent/10 px-6 md:px-8 py-1.5 md:py-2 rounded-full border border-accent/20 mt-2 md:mt-4 animate-in fade-in zoom-in duration-500">
                                        <CheckCircle2 className="h-3 md:h-4 w-3 md:w-4" /> Official Protocol Complete
                                    </div>
                                )}
                            </div>

                            {h2hStats && h2hStats.total > 0 && (
                                <Card className="glass-card border-white/5">
                                    <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-white/5">
                                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Head-to-Head History</CardTitle>
                                        <span className="text-[10px] font-bold opacity-30">{h2hStats.total} Encounters</span>
                                    </CardHeader>
                                    <CardContent className="p-4 flex justify-between items-center gap-4">
                                        <div className="flex-1 text-center">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase mb-1 truncate">{homeTeam.name}</p>
                                            <p className="text-lg md:text-xl font-mono font-black text-accent">{h2hStats.homeWins}</p>
                                        </div>
                                        <div className="flex-1 text-center border-x border-white/5">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Draws</p>
                                            <p className="text-lg md:text-xl font-mono font-black">{h2hStats.draws}</p>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase mb-1 truncate">{awayTeam.name}</p>
                                            <p className="text-lg md:text-xl font-mono font-black text-accent">{h2hStats.awayWins}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <Card className="shadow-none border border-white/5 bg-black/20 rounded-3xl overflow-hidden h-fit">
                            <CardHeader className="py-3 md:py-4 px-4 md:px-6 bg-white/5 flex-row items-center justify-between space-y-0 border-b border-white/5">
                                <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                    <Timer className="h-3 md:h-4 w-3 md:w-4" /> Timeline Data
                                </CardTitle>
                                {isAdmin && ['FINISHED', 'LIVE'].includes(match.status) && (
                                    <Button size="sm" variant="ghost" className="h-7 md:h-8 rounded-full bg-white/5 hover:bg-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest px-3 md:px-4" onClick={() => {setShowEventForm(!showEventForm); setEditingEvent(null); eventForm.reset({type: 'Goal', minute: 1, playerId: '', assisterId: 'none'})}}>
                                        {showEventForm ? 'Cancel' : (
                                            <><PlusCircle className="mr-1.5 h-3 w-3 md:h-3.5 md:w-3.5"/> Add Entry</>
                                        )}
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 md:p-6">
                                {isAdmin && showEventForm && (
                                    <Form {...eventForm}>
                                        <form onSubmit={eventForm.handleSubmit(handleEventSubmit)} className="space-y-4 p-4 mb-6 border border-accent/20 rounded-2xl bg-accent/5 animate-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField control={eventForm.control} name="type" render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-black uppercase opacity-50">Event Identity</FormLabel>
                                                        <Select onValueChange={(val) => { field.onChange(val); if(val !== 'Goal') eventForm.setValue('assisterId', 'none'); }} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger className="h-9 text-xs glass-card"><SelectValue/></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Goal">Goal</SelectItem>
                                                                <SelectItem value="Assist" disabled={!editingEvent}>Assist (Standalone)</SelectItem>
                                                                <SelectItem value="Yellow Card">Yellow Card</SelectItem>
                                                                <SelectItem value="Red Card">Red Card</SelectItem>
                                                                <SelectItem value="Own Goal">Own Goal</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px]"/>
                                                    </FormItem>
                                                )}/>
                                                <FormField control={eventForm.control} name="minute" render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-black uppercase opacity-50">
                                                            {match.isExtraTime ? `Minute in ET (1-${extraDuration})` : `Minute (Max ${baseDuration})`}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                type="number" 
                                                                className="h-9 text-xs glass-card" 
                                                                placeholder="e.g. 5"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]"/>
                                                    </FormItem>
                                                )}/>
                                            </div>
                                            <FormField control={eventForm.control} name="playerId" render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[9px] font-black uppercase opacity-50">Subject Athlete</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger className="h-9 text-xs glass-card"><SelectValue placeholder="Select athlete..."/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">{homeTeam.name}</SelectLabel>
                                                                {homePlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                            </SelectGroup>
                                                            <Separator className="my-2 bg-white/5" />
                                                            <SelectGroup>
                                                                <SelectLabel className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">{awayTeam.name}</SelectLabel>
                                                                {awayPlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]"/>
                                                </FormItem>
                                            )}/>

                                            {eventForm.watch('type') === 'Goal' && (
                                                <FormField control={eventForm.control} name="assisterId" render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-[9px] font-black uppercase opacity-50">Assister (Optional)</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="h-9 text-xs glass-card"><SelectValue placeholder="None"/></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="none">None</SelectItem>
                                                                {eligibleAssisters.map(p => (
                                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}/>
                                            )}

                                            <Button type="submit" className="w-full h-10 text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 hover:bg-white/20 border border-white/10">{editingEvent ? 'Update Registry' : 'Record Event'}</Button>
                                        </form>
                                    </Form>
                                )}
                                
                                <div className="space-y-4 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {match.events && match.events.length > 0 ? (
                                        [...match.events].sort((a,b) => a.minute - b.minute).map(event => {
                                            const isLinkedAssist = !!event.linkedGoalId;
                                            const linkedGoal = event.linkedGoalId ? match.events?.find(e => e.id === event.linkedGoalId) : null;
                                            
                                            return (
                                                <div key={event.id} className="flex items-center gap-3 md:gap-4 text-xs group animate-in fade-in slide-in-from-left-2">
                                                    <span className="font-mono w-6 md:w-8 text-[9px] md:text-[10px] font-black text-accent">{event.minute}'</span>
                                                    <div className="bg-white/5 p-1.5 md:p-2 rounded-xl border border-white/5 shrink-0"><EventIcon type={event.type} /></div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-baseline gap-x-2">
                                                            <span className="font-bold text-xs md:text-sm tracking-tight truncate uppercase">{event.playerName}</span>
                                                            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/20">
                                                                {event.type} {isLinkedAssist && linkedGoal ? `(Goal: ${linkedGoal.playerName} - ${linkedGoal.minute}')` : ''}
                                                            </span>
                                                        </div>
                                                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] text-white/30 truncate">{event.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}</span>
                                                    </div>
                                                    {isAdmin && !isLinkedAssist && (
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                            <Button variant="ghost" size="icon" className="h-7 md:h-8 w-7 md:w-8 hover:bg-white/5" onClick={() => { 
                                                                const linkedAssist = match.events?.find(e => e.linkedGoalId === event.id);
                                                                setEditingEvent(event); 
                                                                setShowEventForm(true); 
                                                                
                                                                const displayMin = match.isExtraTime && event.minute > baseDuration 
                                                                    ? event.minute - baseDuration 
                                                                    : event.minute;

                                                                eventForm.reset({
                                                                    type: event.type, 
                                                                    minute: displayMin, 
                                                                    playerId: event.playerId,
                                                                    assisterId: linkedAssist ? linkedAssist.playerId : 'none'
                                                                }); 
                                                            }}><Pencil className="h-3 md:h-3.5 w-3 md:w-3.5"/></Button>
                                                            <Button variant="ghost" size="icon" className="h-7 md:h-8 w-7 md:w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteMatchEvent(match.id, event.id)}><Trash2 className="h-3 md:h-3.5 w-3 md:w-3.5"/></Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-white/10">
                                            <Sword className="h-10 md:h-12 w-10 md:w-12 mb-4 opacity-5" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Recorded Events</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
