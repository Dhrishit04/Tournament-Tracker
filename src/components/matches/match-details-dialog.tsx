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
import { PlusCircle, Goal, Footprints, Trash2, Pencil, CheckCircle2, Settings2, Timer, Sword } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useSeason } from '@/contexts/season-context';

const eventSchema = z.object({
  type: z.enum(['Goal', 'Assist', 'Yellow Card', 'Red Card', 'Own Goal']),
  playerId: z.string().min(1, 'Player is required'),
  minute: z.coerce.number().min(0).max(120),
  assisterId: z.string().optional(),
});

const matchSettingsSchema = z.object({
  status: z.enum(['UPCOMING', 'LIVE', 'FINISHED', 'POSTPONED']),
  stage: z.enum(['GROUP_STAGE', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINALS', 'OTHERS']),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().optional(),
  description: z.string().optional(),
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
    const [isExtraTimePromptOpen, setIsExtraTimePromptOpen] = useState(false);

    const eventForm = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: { type: 'Goal', minute: 0, assisterId: 'none' },
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
        },
    });

    // Reset settings form when match data changes
    useEffect(() => {
        if (match) {
            settingsForm.reset({
                status: match.status,
                stage: match.stage,
                date: format(new Date(match.date), 'yyyy-MM-dd'),
                time: match.time,
                venue: match.venue || '',
                description: match.description || '',
            });
        }
    }, [match, settingsForm]);

    const goalsCount = useMemo(() => match?.events?.filter(e => e.type === 'Goal' || e.type === 'Own Goal').length || 0, [match?.events]);
    const assistsCount = useMemo(() => match?.events?.filter(e => e.type === 'Assist').length || 0, [match?.events]);

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

    // Filtered players for assister logic (Prompt 1)
    const selectedScorerId = eventForm.watch('playerId');
    const selectedScorer = players.find(p => p.id === selectedScorerId);
    const eligibleAssisters = useMemo(() => {
        if (!selectedScorer) return [];
        return players.filter(p => p.teamId === selectedScorer.teamId && p.id !== selectedScorer.id);
    }, [selectedScorer, players]);

    const handleEventSubmit = async (values: z.infer<typeof eventSchema>) => {
        const { assisterId, ...baseValues } = values;
        const player = players.find(p => p.id === values.playerId);
        if (!player) return;

        if (editingEvent) {
            // Update Goal Logic (Prompt 2, 3, 4)
            await updateMatchEvent(match.id, editingEvent.id, { 
                ...baseValues, 
                teamId: player.teamId, 
                playerName: player.name,
                assisterId: (assisterId && assisterId !== 'none') ? assisterId : undefined
            });
        } else {
            // Create New Goal Logic
            if (values.type === 'Goal' && assisterId && assisterId !== 'none') {
                const assister = players.find(p => p.id === assisterId);
                if (!assister) return;
                const goalEventId = `evt-${Date.now()}`;
                await addMatchEvent(match.id, { ...baseValues, id: goalEventId, teamId: player.teamId, playerName: player.name });
                await addMatchEvent(match.id, { 
                    type: 'Assist', 
                    minute: values.minute, 
                    playerId: assister.id, 
                    teamId: assister.teamId, 
                    playerName: assister.name, 
                    linkedGoalId: goalEventId 
                });
            } else {
                await addMatchEvent(match.id, { ...baseValues, id: `evt-${Date.now()}`, teamId: player.teamId, playerName: player.name });
            }
        }
        resetEventForm();
    };

    const handleDeclareMatch = async () => {
        const isDraw = match.homeScore === match.awayScore;
        const isKnockout = match.stage !== 'GROUP_STAGE';

        if (isDraw && isKnockout) {
            setIsExtraTimePromptOpen(true);
        } else {
            await updateMatchStatus(match.id, 'FINISHED');
            settingsForm.setValue('status', 'FINISHED');
        }
    };

    const handleConfirmExtraTime = async () => {
        setIsExtraTimePromptOpen(false);
        logAction("EXTRA_TIME", `Initiated Extra Time protocol for ${homeTeam.name} vs ${awayTeam.name}`);
        toast({ title: 'Extra Time Active', description: 'Match remains LIVE. Record additional events below.' });
    };

    const handleConfirmFinishAsDraw = async () => {
        setIsExtraTimePromptOpen(false);
        await updateMatchStatus(match.id, 'FINISHED');
        settingsForm.setValue('status', 'FINISHED');
    };

    const handleSettingsSubmit = async (values: z.infer<typeof matchSettingsSchema>) => {
        const updatedMatch: Match = {
            ...match,
            status: values.status,
            stage: values.stage,
            date: parseISO(values.date),
            time: values.time,
            venue: values.venue,
            description: values.description,
        };
        await updateMatch(updatedMatch);
        setShowSettingsForm(false);
        toast({ title: "Updated", description: "Match details saved successfully." });
    };

    const resetEventForm = () => {
        eventForm.reset({ type: 'Goal', minute: 0, playerId: '', assisterId: 'none' });
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
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-white/5">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Match <span className="text-accent">Protocol</span></DialogTitle>
                    <Badge variant="outline" className="text-[10px] font-black tracking-widest border-white/10 uppercase">{match.stage?.replace('_', ' ')}</Badge>
                </div>
                <DialogDescription className="font-bold text-xs uppercase tracking-widest opacity-50">{format(new Date(match.date), 'EEEE, MMMM d, yyyy')}</DialogDescription>
            </div>
            {isAdmin && (
                <div className="flex gap-2 mr-8">
                    <Button variant="ghost" size="sm" onClick={() => setShowSettingsForm(!showSettingsForm)} className="h-8 rounded-full hover:bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                        <Settings2 className="w-3 h-3 mr-2" /> {showSettingsForm ? 'Close' : 'Config'}
                    </Button>
                    <Button variant="destructive" size="sm" className="h-8 rounded-full text-[10px] font-bold uppercase tracking-widest" onClick={async () => { if(confirm('Delete fixture and revert stats?')) { await deleteMatch(match.id); onClose(); } }}>
                        <Trash2 className="w-3 h-3 mr-1" /> Decommission
                    </Button>
                </div>
            )}
          </div>
        </DialogHeader>
        
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
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest px-6 bg-accent hover:bg-accent/90">Update Registry</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="flex flex-col items-center justify-center bg-white/5 p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Sword className="h-32 w-32 rotate-12" />
                 </div>
                 
                 <div className="flex items-center justify-around w-full mb-8 gap-4 relative z-10">
                    <div className="flex flex-col items-center w-[40%] text-center min-w-0">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-accent/20 shadow-xl shrink-0 group">
                            <Image src={homeLogo.imageUrl} alt={homeTeam.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" data-ai-hint={homeLogo.imageHint}/>
                        </div>
                        <span className="font-black text-xs sm:text-sm leading-tight truncate w-full uppercase tracking-tighter" title={homeTeam.name}>{homeTeam.name}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-5xl font-black font-mono tracking-tighter flex items-center gap-3">
                            {match.status === 'FINISHED' || match.status === 'LIVE' ? (
                            <>
                                <span className={cn(match.homeScore! > match.awayScore! ? "text-accent" : "")}>{match.homeScore ?? 0}</span>
                                <span className="text-white/10 font-sans">-</span>
                                <span className={cn(match.awayScore! > match.homeScore! ? "text-accent" : "")}>{match.awayScore ?? 0}</span>
                            </>
                            ) : (
                            <span className="text-xl text-white/40 font-sans font-black uppercase tracking-[0.2em]">{match.time}</span>
                            )}
                        </div>
                        {stageTiming?.duration && (
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <Timer className="h-3 w-3" /> {stageTiming.duration}m Base
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center w-[40%] text-center min-w-0">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-accent/20 shadow-xl shrink-0 group">
                            <Image src={awayLogo.imageUrl} alt={awayTeam.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" data-ai-hint={awayLogo.imageHint} />
                        </div>
                        <span className="font-black text-xs sm:text-sm leading-tight truncate w-full uppercase tracking-tighter" title={awayTeam.name}>{awayTeam.name}</span>
                    </div>
                </div>

                {isAdmin && match.status === 'LIVE' && (
                    <Button onClick={handleDeclareMatch} className="bg-green-600 hover:bg-green-700 w-full font-black italic uppercase tracking-widest h-12 shadow-lg shadow-green-900/20">
                        <CheckCircle2 className="mr-2 h-5 w-5" /> Declare Finished
                    </Button>
                )}
                {match.status === 'FINISHED' && (
                    <div className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-[0.3em] bg-accent/10 px-8 py-2 rounded-full border border-accent/20 mt-4 animate-in fade-in zoom-in duration-500">
                        <CheckCircle2 className="h-4 w-4" /> Official Protocol Complete
                    </div>
                )}
            </div>

            <Card className="shadow-none border border-white/5 bg-black/20 rounded-3xl overflow-hidden">
                <CardHeader className="py-4 px-6 bg-white/5 flex-row items-center justify-between space-y-0 border-b border-white/5">
                    <CardTitle className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Timeline Data
                    </CardTitle>
                    {isAdmin && ['FINISHED', 'LIVE'].includes(match.status) && (
                        <Button size="sm" variant="ghost" className="h-8 rounded-full bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest px-4" onClick={() => {setShowEventForm(!showEventForm); setEditingEvent(null); eventForm.reset({type: 'Goal', minute: 0, playerId: '', assisterId: 'none'})}}>
                            {showEventForm ? 'Cancel' : (
                                <><PlusCircle className="mr-1.5 h-3.5 w-3.5"/> Add Entry</>
                            )}
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-6">
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
                                        <FormItem className="space-y-1"><FormLabel className="text-[9px] font-black uppercase opacity-50">Match Minute</FormLabel><FormControl><Input type="number" className="h-9 text-xs glass-card" {...field}/></FormControl><FormMessage className="text-[10px]"/></FormItem>
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
                    <ScrollArea className="h-[250px] pr-4">
                    {match.events && match.events.length > 0 ? (
                        <div className="space-y-4">
                            {[...match.events].sort((a,b) => a.minute - b.minute).map(event => {
                                const isLinkedAssist = !!event.linkedGoalId;
                                const linkedGoal = event.linkedGoalId ? match.events?.find(e => e.id === event.linkedGoalId) : null;
                                
                                return (
                                <div key={event.id} className="flex items-center gap-4 text-xs group animate-in fade-in slide-in-from-left-2">
                                    <span className="font-mono w-8 text-[10px] font-black text-accent">{event.minute}'</span>
                                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 shrink-0"><EventIcon type={event.type} /></div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="flex flex-wrap items-baseline gap-x-2">
                                            <span className="font-bold text-sm tracking-tight truncate uppercase">{event.playerName}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                                                {event.type} {isLinkedAssist && linkedGoal ? `(Goal: ${linkedGoal.playerName} - ${linkedGoal.minute}')` : ''}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 truncate">{event.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}</span>
                                    </div>
                                    {isAdmin && !isLinkedAssist && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5" onClick={() => { 
                                                const linkedAssist = match.events?.find(e => e.linkedGoalId === event.id);
                                                setEditingEvent(event); 
                                                setShowEventForm(true); 
                                                eventForm.reset({
                                                    type: event.type, 
                                                    minute: event.minute, 
                                                    playerId: event.playerId,
                                                    assisterId: linkedAssist ? linkedAssist.playerId : 'none'
                                                }); 
                                            }}><Pencil className="h-3.5 w-3.5"/></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteMatchEvent(match.id, event.id)}><Trash2 className="h-3.5 w-3.5"/></Button>
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/10 pt-10">
                            <Sword className="h-12 w-12 mb-4 opacity-5" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Recorded Events</p>
                        </div>
                    )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={isExtraTimePromptOpen} onOpenChange={setIsExtraTimePromptOpen}>
        <AlertDialogContent className="glass-card border-white/5">
            <AlertDialogHeader>
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                    <Timer className="h-6 w-6 text-accent" />
                </div>
                <AlertDialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Match <span className="text-accent">Locked</span></AlertDialogTitle>
                <AlertDialogDescription className="text-white/70">
                    The fixture has ended in a draw ({match.homeScore}-{match.awayScore}). Since this is a knockout stage, do you want to initiate **Extra Time Protocol** or conclude as a draw?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-3">
                {stageTiming?.extraTime && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Configured Extra Time</span>
                        <span className="text-xs font-black text-accent">{stageTiming.extraTime} Minutes</span>
                    </div>
                )}
            </div>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3">
                <AlertDialogCancel onClick={handleConfirmFinishAsDraw} className="mt-0 glass-card border-white/10 hover:bg-white/5 uppercase tracking-widest text-[10px] font-black h-12">Conclude as Draw</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmExtraTime} className="bg-accent hover:bg-accent/90 uppercase tracking-widest text-[10px] font-black h-12">Initiate Extra Time</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
