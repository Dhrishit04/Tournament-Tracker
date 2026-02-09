'use client';

import { useState, useMemo } from 'react';
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
import { type Player, type MatchEvent, type Match, type MatchStage } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useData } from '@/hooks/use-data';
import { getImageUrl } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Goal, Footprints, Trash2, Pencil, CheckCircle2, Settings2 } from 'lucide-react';
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
    const { matches, players, teams, addMatchEvent, updateMatchEvent, deleteMatchEvent, updateMatchStatus, updateMatch, deleteMatch } = useData();
    const { currentSeason } = useSeason();
    const { toast } = useToast();
    
    const match = matches.find(m => m.id === matchId);

    const [showEventForm, setShowEventForm] = useState(false);
    const [showSettingsForm, setShowSettingsForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<MatchEvent | null>(null);
    const [eventToDelete, setEventToDelete] = useState<MatchEvent | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

    const goalsCount = useMemo(() => match?.events?.filter(e => e.type === 'Goal' || e.type === 'Own Goal').length || 0, [match?.events]);
    const assistsCount = useMemo(() => match?.events?.filter(e => e.type === 'Assist').length || 0, [match?.events]);

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

    if (!match) return null;
    
    const homeTeam = teams.find(t => t.id === match.homeTeamId);
    const awayTeam = teams.find(t => t.id === match.awayTeamId);

    if (!homeTeam || !awayTeam) return null;

    const homePlayers = players.filter(p => p.teamId === homeTeam.id);
    const awayPlayers = players.filter(p => p.teamId === awayTeam.id);

    const homeLogo = getImageUrl(homeTeam.logoUrl);
    const awayLogo = getImageUrl(awayTeam.logoUrl);

    const showVenue = currentSeason?.matchConfig.showVenue ?? true;

    const selectedPlayerId = eventForm.watch('playerId');
    const selectedPlayer = players.find(p => p.id === selectedPlayerId);
    const playerTeamId = selectedPlayer?.teamId;

    const handleEventSubmit = async (values: z.infer<typeof eventSchema>) => {
        const { assisterId, ...baseValues } = values;

        if (values.type === 'Assist' && assistsCount >= goalsCount && !editingEvent) {
            toast({
                variant: 'destructive',
                title: 'Invalid Event',
                description: 'Assists cannot exceed the number of goals scored.',
            });
            return;
        }

        const player = players.find(p => p.id === values.playerId);
        if (!player) return;

        if (editingEvent) {
            const eventData = { ...baseValues, teamId: player.teamId, playerName: player.name };
            await updateMatchEvent(match.id, editingEvent.id, eventData);

            if (editingEvent.type === 'Goal') {
                const oldAssist = match.events?.find(e => e.type === 'Assist' && e.linkedGoalId === editingEvent.id);
                
                if (assisterId && assisterId !== 'none') {
                    const assister = players.find(p => p.id === assisterId);
                    if (assister) {
                        if (oldAssist) {
                            await updateMatchEvent(match.id, oldAssist.id, {
                                type: 'Assist',
                                minute: values.minute,
                                playerId: assister.id,
                                teamId: assister.teamId,
                                playerName: assister.name,
                                linkedGoalId: editingEvent.id
                            });
                        } else {
                            await addMatchEvent(match.id, {
                                type: 'Assist',
                                minute: values.minute,
                                playerId: assister.id,
                                teamId: assister.teamId,
                                playerName: assister.name,
                                linkedGoalId: editingEvent.id
                            });
                        }
                    }
                } else if (oldAssist) {
                    await deleteMatchEvent(match.id, oldAssist.id);
                }
            }
        } else {
            if (values.type === 'Goal' && assisterId && assisterId !== 'none') {
                const assister = players.find(p => p.id === assisterId);
                if (!assister) return;

                const goalEventId = `evt-${Date.now()}`;
                const goalEvent = { ...baseValues, id: goalEventId, teamId: player.teamId, playerName: player.name };
                const assistEvent = { 
                    type: 'Assist' as const, 
                    minute: values.minute, 
                    playerId: assister.id, 
                    teamId: assister.teamId, 
                    playerName: assister.name,
                    linkedGoalId: goalEventId
                };

                await addMatchEvent(match.id, goalEvent);
                await addMatchEvent(match.id, assistEvent);
            } else {
                const eventData = { ...baseValues, teamId: player.teamId, playerName: player.name };
                await addMatchEvent(match.id, eventData);
            }
        }
        resetEventForm();
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

    const handleDeclareMatch = async () => {
        await updateMatchStatus(match.id, 'FINISHED');
        settingsForm.setValue('status', 'FINISHED');
    };

    const handleEditClick = (event: MatchEvent) => {
        setEditingEvent(event);
        setShowEventForm(true);
        
        let initialAssisterId = 'none';
        if (event.type === 'Goal') {
            const linkedAssist = match.events?.find(e => e.type === 'Assist' && e.linkedGoalId === event.id);
            if (linkedAssist) {
                initialAssisterId = linkedAssist.playerId;
            }
        }

        eventForm.reset({ 
            type: event.type, 
            playerId: event.playerId, 
            minute: event.minute, 
            assisterId: initialAssisterId 
        });
    };
    
    const handleDeleteConfirm = async () => {
        if (eventToDelete) {
            await deleteMatchEvent(match.id, eventToDelete.id);
            if (eventToDelete.type === 'Goal') {
                const linkedAssist = match.events?.find(e => e.type === 'Assist' && e.linkedGoalId === eventToDelete.id);
                if (linkedAssist) {
                    await deleteMatchEvent(match.id, linkedAssist.id);
                }
            }
            setEventToDelete(null);
        }
    }

    const handleMatchDelete = async () => {
        await deleteMatch(match.id);
        setIsDeleteDialogOpen(false);
        onClose();
    }

    const resetEventForm = () => {
        eventForm.reset({ type: 'Goal', minute: 0, playerId: '', assisterId: 'none' });
        setShowEventForm(false);
        setEditingEvent(null);
    }

    const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'Unknown';
    
    const EventIcon = ({type}: {type: MatchEvent['type']}) => {
        switch(type) {
            case 'Goal': return <Goal className="w-4 h-4 text-green-500"/>
            case 'Assist': return <Footprints className="w-4 h-4 text-blue-500" />
            case 'Own Goal': return <Goal className="w-4 h-4 text-red-500" />
            case 'Yellow Card': return <div className="w-3 h-4 bg-yellow-400 border border-black/20 rounded-sm"/>
            case 'Red Card': return <div className="w-3 h-4 bg-red-600 border border-black/20 rounded-sm"/>
            default: return null
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
                <DialogTitle>Match Details</DialogTitle>
                <DialogDescription>{format(new Date(match.date), 'EEEE, MMMM d, yyyy')}</DialogDescription>
            </div>
            {isAdmin && (
                <div className="flex gap-2 mr-8">
                    <Button variant="outline" size="sm" onClick={() => setShowSettingsForm(!showSettingsForm)}>
                        <Settings2 className="w-4 h-4 mr-2" /> {showSettingsForm ? 'Close' : 'Admin'}
                    </Button>
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Permanently delete match?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will revert all associated statistics. This action is irreversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleMatchDelete} className="bg-destructive hover:bg-destructive/90">
                                    Yes, Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
          </div>
        </DialogHeader>
        
        {isAdmin && showSettingsForm && (
            <Card className="mb-6 bg-secondary/10">
                <CardHeader className="py-3 px-4"><CardTitle className="text-xs font-bold uppercase tracking-wider">Settings</CardTitle></CardHeader>
                <CardContent className="px-4 pb-4">
                    <Form {...settingsForm}>
                        <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <FormField control={settingsForm.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel className="text-xs">Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="UPCOMING">Upcoming</SelectItem><SelectItem value="LIVE">Live</SelectItem><SelectItem value="FINISHED">Finished</SelectItem><SelectItem value="POSTPONED">Postponed</SelectItem></SelectContent></Select></FormItem>
                                )}/>
                                <FormField control={settingsForm.control} name="stage" render={({ field }) => (
                                    <FormItem><FormLabel className="text-xs">Stage</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger></FormControl><SelectContent>{availableStages.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></FormItem>
                                )}/>
                                {showVenue && (
                                    <FormField control={settingsForm.control} name="venue" render={({ field }) => (
                                        <FormItem><FormLabel className="text-xs">Venue</FormLabel><FormControl><Input className="h-8 text-xs" {...field}/></FormControl></FormItem>
                                    )}/>
                                )}
                                <FormField control={settingsForm.control} name="date" render={({ field }) => (
                                    <FormItem><FormLabel className="text-xs">Date</FormLabel><FormControl><Input type="date" className="h-8 text-xs" {...field}/></FormControl></FormItem>
                                )}/>
                                <FormField control={settingsForm.control} name="time" render={({ field }) => (
                                    <FormItem><FormLabel className="text-xs">Time</FormLabel><FormControl><Input className="h-8 text-xs" {...field}/></FormControl></FormItem>
                                )}/>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" size="sm" className="h-8 text-xs px-4">Update Info</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            <div className="flex flex-col items-center justify-center bg-secondary/5 p-4 rounded-xl border border-border/40">
                 <div className="flex items-center justify-around w-full mb-6 gap-2">
                    <div className="flex flex-col items-center w-[40%] text-center min-w-0">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 border border-primary/20 shadow-sm shrink-0">
                        <Image src={homeLogo.imageUrl} alt={homeTeam.name} fill className="object-cover" data-ai-hint={homeLogo.imageHint}/>
                        </div>
                        <span className="font-bold text-sm leading-tight truncate w-full" title={homeTeam.name}>{homeTeam.name}</span>
                    </div>
                    <div className="text-4xl font-black font-mono tracking-tighter flex items-center gap-2 shrink-0">
                        {match.status === 'FINISHED' || match.status === 'LIVE' ? (
                        <>
                            <span>{match.homeScore ?? 0}</span>
                            <span className="text-muted-foreground/30 font-sans">-</span>
                            <span>{match.awayScore ?? 0}</span>
                        </>
                        ) : (
                        <span className="text-base text-muted-foreground font-sans font-medium uppercase tracking-widest">{match.time}</span>
                        )}
                    </div>
                    <div className="flex flex-col items-center w-[40%] text-center min-w-0">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 border border-primary/20 shadow-sm shrink-0">
                        <Image src={awayLogo.imageUrl} alt={awayTeam.name} fill className="object-cover" data-ai-hint={awayLogo.imageHint} />
                        </div>
                        <span className="font-bold text-sm leading-tight truncate w-full" title={awayTeam.name}>{awayTeam.name}</span>
                    </div>
                </div>
                {isAdmin && match.status === 'LIVE' && (
                    <Button onClick={handleDeclareMatch} className="bg-green-600 hover:bg-green-700 w-full font-bold h-10 mt-4">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Declare Result
                    </Button>
                )}
                {match.status === 'FINISHED' && (
                    <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] bg-secondary/50 px-4 py-1.5 rounded-full border border-border/40 mt-4">
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> Full Time
                    </div>
                )}
            </div>

            <Card className="shadow-none border border-border/40">
                <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">Match Timeline</CardTitle>
                    {isAdmin && ['FINISHED', 'LIVE'].includes(match.status) && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => {setShowEventForm(!showEventForm); setEditingEvent(null); eventForm.reset({type: 'Goal', minute: 0, playerId: '', assisterId: 'none'})}}>
                            {showEventForm ? 'Cancel' : (
                                <><PlusCircle className="mr-1 h-3.5 w-3.5"/> Add</>
                            )}
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="px-4 pb-4">
                     {isAdmin && showEventForm && (
                        <Form {...eventForm}>
                            <form onSubmit={eventForm.handleSubmit(handleEventSubmit)} className="space-y-3 p-3 mb-4 border rounded-lg bg-secondary/5">
                                 <div className="grid grid-cols-2 gap-2">
                                    <FormField control={eventForm.control} name="type" render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Goal">Goal</SelectItem>
                                                    <SelectItem value="Assist" disabled={goalsCount <= assistsCount && !editingEvent}>
                                                        Assist {goalsCount <= assistsCount && !editingEvent && "(!)"}
                                                    </SelectItem>
                                                    <SelectItem value="Yellow Card">Yellow Card</SelectItem>
                                                    <SelectItem value="Red Card">Red Card</SelectItem>
                                                    <SelectItem value="Own Goal">Own Goal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px]"/>
                                        </FormItem>
                                    )}/>
                                     <FormField control={eventForm.control} name="minute" render={({ field }) => (
                                        <FormItem className="space-y-1"><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Minute</FormLabel><FormControl><Input type="number" className="h-8 text-xs" {...field}/></FormControl><FormMessage className="text-[10px]"/></FormItem>
                                    )}/>
                                 </div>
                                 <FormField control={eventForm.control} name="playerId" render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Player</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..."/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel className="text-[10px] font-bold text-primary uppercase tracking-wider truncate max-w-[200px]">{getTeamName(homeTeam.id)}</SelectLabel>
                                                    {homePlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                </SelectGroup>
                                                <Separator className="my-1" />
                                                <SelectGroup>
                                                    <SelectLabel className="text-[10px] font-bold text-primary uppercase tracking-wider truncate max-w-[200px]">{getTeamName(awayTeam.id)}</SelectLabel>
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
                                            <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Assisted by</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None (Solo)</SelectItem>
                                                    {playerTeamId === homeTeam.id && (
                                                        <SelectGroup>
                                                            <SelectLabel className="text-[10px] font-bold uppercase text-primary truncate max-w-[200px]">{getTeamName(homeTeam.id)}</SelectLabel>
                                                            {homePlayers.filter(p => p.id !== selectedPlayerId).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                        </SelectGroup>
                                                    )}
                                                    {playerTeamId === awayTeam.id && (
                                                        <SelectGroup>
                                                            <SelectLabel className="text-[10px] font-bold uppercase text-primary truncate max-w-[200px]">{getTeamName(awayTeam.id)}</SelectLabel>
                                                            {awayPlayers.filter(p => p.id !== selectedPlayerId).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                        </SelectGroup>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px]"/>
                                        </FormItem>
                                    )} />
                                )}
                                <Button type="submit" className="w-full h-8 text-xs">{editingEvent ? 'Update' : 'Record'}</Button>
                            </form>
                        </Form>
                     )}
                    <ScrollArea className="h-[200px] pr-2">
                    {match.events && match.events.length > 0 ? (
                        <div className="space-y-3">
                            {[...match.events].sort((a,b) => a.minute - b.minute).map(event => {
                                const linkedGoal = event.type === 'Assist' && event.linkedGoalId ? match.events?.find(e => e.id === event.linkedGoalId) : null;
                                return (
                                    <div key={event.id} className="flex items-center gap-2 text-xs group animate-in fade-in slide-in-from-left-2">
                                        <span className="font-mono w-6 text-[10px] text-muted-foreground">{event.minute}'</span>
                                        <div className="bg-secondary/20 p-1 rounded-md shrink-0"><EventIcon type={event.type} /></div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex flex-wrap items-baseline gap-x-1.5">
                                                <span className="font-bold leading-tight truncate">{event.playerName}</span>
                                                {linkedGoal && (
                                                    <span className="text-[9px] text-muted-foreground font-normal whitespace-nowrap">
                                                        (Goal: {linkedGoal.playerName} - {linkedGoal.minute}')
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-muted-foreground uppercase font-medium truncate">{getTeamName(event.teamId)}</span>
                                        </div>
                                        {isAdmin && event.type !== 'Assist' && (
                                            <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditClick(event)}><Pencil className="h-3 w-3"/></Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setEventToDelete(event)}><Trash2 className="h-3 w-3"/></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Remove event?</AlertDialogTitle><AlertDialogDescription>This will revert associated stats.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleDeleteConfirm}>Remove</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground pt-4 opacity-40">
                            <Goal className="h-6 w-6 mb-1" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No Events</p>
                        </div>
                    )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
