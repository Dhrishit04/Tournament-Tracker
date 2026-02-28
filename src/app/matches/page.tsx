'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Match, MatchStage, Team } from '@/types';
import { format } from 'date-fns';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { useSeason } from '@/contexts/season-context';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl, cn } from '@/lib/utils';
import { MatchDetailsDialog } from '@/components/matches/match-details-dialog';
import { motion, AnimatePresence } from 'framer-motion';

function LivePulse() {
    return (
        <div className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </div>
    );
}

function MatchCard({ match, onCardClick, teams, isGroupMode, showVenue }: { match: Match, onCardClick: (match: Match) => void, teams: Team[], isGroupMode: boolean, showVenue: boolean }) {
    const homeTeam = teams.find(t => t.id === match.homeTeamId);
    const awayTeam = teams.find(t => t.id === match.awayTeamId);

    if (!homeTeam || !awayTeam) {
        return <Card className="h-full border-white/5 bg-white/5"><CardContent className="h-[210px] flex items-center justify-center"><Skeleton className="h-12 w-12 rounded-full opacity-10" /></CardContent></Card>;
    }

    const homeLogo = getImageUrl(homeTeam.logoUrl);
    const awayLogo = getImageUrl(awayTeam.logoUrl);
    const groupName = isGroupMode && match.stage === 'GROUP_STAGE' ? homeTeam.group : null;

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="h-full"
        >
            <Card className="glass-card border-white/5 hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5 flex flex-col h-full overflow-hidden transition-colors group">
                <div className="flex-grow cursor-pointer" onClick={() => onCardClick(match)}>
                    <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex justify-between items-start text-xs text-muted-foreground w-full">
                            <span className="font-bold uppercase tracking-widest text-[9px] opacity-60 group-hover:text-accent transition-colors">{format(new Date(match.date), 'EEE, MMM d')}</span>
                            <div className="flex items-center gap-1.5">
                                {match.isExtraTime && match.status === 'LIVE' && (
                                    <Badge className="bg-accent text-white text-[8px] h-5 font-black animate-pulse border-none">ET</Badge>
                                )}
                                <Badge
                                    variant={match.status === 'FINISHED' ? 'secondary' : 'default'}
                                    className={cn(
                                        match.status === 'UPCOMING' ? 'bg-accent/10 text-accent border-accent/20' : '',
                                        match.status === 'LIVE' ? 'bg-red-500 text-white animate-pulse border-none' : '',
                                        "text-[9px] uppercase font-black px-2 py-0.5 tracking-widest"
                                    )}
                                >
                                    {match.status === 'LIVE' && <LivePulse />}
                                    {match.status}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        {groupName && groupName !== 'None' && (
                            <div className="flex justify-center mb-4">
                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] text-accent border-accent/20 bg-accent/5">Group {groupName}</Badge>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-2 w-full mt-2">
                            <div className="flex-1 min-w-0 flex flex-col items-center text-center gap-3">
                                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-white/10 shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                    <Image src={homeLogo.imageUrl} alt={homeTeam.name} fill className="object-cover" data-ai-hint={homeLogo.imageHint} />
                                </div>
                                <span className="font-black text-[10px] md:text-xs uppercase tracking-tighter truncate w-full block leading-none" title={homeTeam.name}>{homeTeam.name}</span>
                            </div>

                            <div className="shrink-0 min-w-[70px] text-center px-1">
                                {match.status === 'FINISHED' || match.status === 'LIVE' ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center justify-center gap-2 text-xl md:text-2xl font-black font-mono tracking-tighter bg-black/40 px-3 py-1 rounded-xl border border-white/10 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                                            <span className={cn(match.homeScore! > match.awayScore! ? "text-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" : "text-white/80")}>{match.homeScore ?? '0'}</span>
                                            <span className="text-white/10 font-sans font-normal">-</span>
                                            <span className={cn(match.awayScore! > match.homeScore! ? "text-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" : "text-white/80")}>{match.awayScore ?? '0'}</span>
                                        </div>
                                        {match.isExtraTime && (
                                            <span className="text-[7px] font-black text-accent uppercase tracking-widest bg-accent/10 px-1.5 rounded-full border border-accent/20">AET</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-black font-mono text-accent whitespace-nowrap bg-accent/5 border border-accent/20 px-3 py-1.5 rounded-xl tracking-widest shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                                        {match.time}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col items-center text-center gap-3">
                                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-white/10 shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                    <Image src={awayLogo.imageUrl} alt={awayTeam.name} fill className="object-cover" data-ai-hint={awayLogo.imageHint} />
                                </div>
                                <span className="font-black text-[10px] md:text-xs uppercase tracking-tighter truncate w-full block leading-none" title={awayTeam.name}>{awayTeam.name}</span>
                            </div>
                        </div>
                        {showVenue && match.venue && (
                            <p className="text-center text-[8px] uppercase font-black tracking-[0.2em] text-white/20 mt-6 truncate px-2 group-hover:text-accent/40 transition-colors">{match.venue}</p>
                        )}
                    </CardContent>
                </div>
                {match.stage === 'OTHERS' && match.description && (
                    <div className="text-center text-[9px] font-bold text-muted-foreground mt-auto mb-4 border-t border-white/5 mx-6 pt-3 italic line-clamp-2 uppercase tracking-widest opacity-40">
                        {match.description}
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

export default function MatchesPage() {
    const { matches, teams, loading } = useData();
    const { currentSeason, loading: seasonLoading } = useSeason();
    const { isAdmin } = useAuth();
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

    const pageLoading = loading || seasonLoading || !currentSeason;

    if (pageLoading) {
        return (
            <div className="container mx-auto px-4 py-24 max-w-6xl relative z-10">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Match <span className="text-gradient-purple">Center</span></h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 glass-card border-white/5" />)}
                </div>
            </div>
        )
    }

    const STAGES: { key: MatchStage, label: string, show: boolean | undefined }[] = [
        { key: 'GROUP_STAGE', label: 'Group Stage', show: currentSeason?.matchConfig.showGroupStage },
        { key: 'QUARTER_FINALS', label: 'Quarter-Finals', show: currentSeason?.matchConfig.showQuarterFinals && teams.length >= 16 },
        { key: 'SEMI_FINALS', label: 'Semi-Finals', show: true },
        { key: 'FINALS', label: 'Finals', show: true },
        { key: 'OTHERS', label: 'Others', show: currentSeason?.matchConfig.showOthers },
    ];

    const matchesByStage: { [key in MatchStage]: Match[] } = {
        GROUP_STAGE: matches.filter(m => m.stage === 'GROUP_STAGE'),
        QUARTER_FINALS: matches.filter(m => m.stage === 'QUARTER_FINALS'),
        SEMI_FINALS: matches.filter(m => m.stage === 'SEMI_FINALS'),
        FINALS: matches.filter(m => m.stage === 'FINALS'),
        OTHERS: matches.filter(m => m.stage === 'OTHERS'),
    };

    const hasAnyMatches = STAGES.some(stage => stage.show && matchesByStage[stage.key].length > 0);
    const isGroupMode = currentSeason?.matchConfig.isGroupModeActive;
    const showVenue = currentSeason?.matchConfig.showVenue ?? true;

    return (
        <div className="container mx-auto px-4 py-24 max-w-6xl relative z-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/5 pb-8"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Match <span className="text-gradient-purple">Center</span></h1>
                    <p className="text-muted-foreground text-lg">Strategic fixtures and official protocol history.</p>
                </div>
                {isAdmin && (
                    <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-accent hover:border-accent hover:text-white transition-all shadow-xl font-bold uppercase tracking-widest text-[10px]">
                        <Link href="/admin/matches">
                            <PlusCircle className="mr-2 h-4 w-4" /> Manage Fixtures
                        </Link>
                    </Button>
                )}
            </motion.div>

            <div className="space-y-20">
                {hasAnyMatches ? STAGES.filter(s => s.show).map((stage, sIdx) => {
                    const stageMatches = matchesByStage[stage.key];
                    if (stageMatches.length === 0) return null;

                    if (stage.key === 'GROUP_STAGE' && isGroupMode) {
                        const groups = Array.from(new Set(stageMatches.map(m => {
                            const homeTeam = teams.find(t => t.id === m.homeTeamId);
                            return homeTeam?.group;
                        }).filter(Boolean))).sort() as string[];

                        return (
                            <motion.div
                                key={stage.key}
                                variants={sectionVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                className="space-y-12"
                            >
                                <div className="flex items-center gap-4">
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">{stage.label}</h2>
                                    <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
                                </div>
                                {groups.map((group, gIdx) => {
                                    const groupMatches = stageMatches.filter(m => teams.find(t => t.id === m.homeTeamId)?.group === group);
                                    const upcoming = groupMatches.filter(m => ['UPCOMING', 'LIVE', 'POSTPONED'].includes(m.status));
                                    const finished = groupMatches.filter(m => m.status === 'FINISHED');

                                    return (
                                        <div key={group} className="relative pl-6 md:pl-8 border-l-2 border-accent/20">
                                            <div className="absolute left-[-5px] top-0 w-2 h-8 bg-accent rounded-full" />
                                            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-8 text-foreground/80 flex items-center gap-3">
                                                Group <span className="text-accent">{group}</span>
                                            </h3>
                                            {upcoming.length > 0 && (
                                                <div className="mb-12">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Fixtures
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                                        {upcoming.map(match => <MatchCard key={match.id} match={match} teams={teams} onCardClick={(m) => setSelectedMatchId(m.id)} isGroupMode={true} showVenue={showVenue} />)}
                                                    </div>
                                                </div>
                                            )}
                                            {finished.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Results
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                                        {finished.map(match => <MatchCard key={match.id} match={match} teams={teams} onCardClick={(m) => setSelectedMatchId(m.id)} isGroupMode={true} showVenue={showVenue} />)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )
                    }

                    const upcoming = stageMatches.filter(m => ['UPCOMING', 'LIVE', 'POSTPONED'].includes(m.status));
                    const finished = stageMatches.filter(m => m.status === 'FINISHED');

                    return (
                        <motion.div
                            key={stage.key}
                            variants={sectionVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter">{stage.label}</h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
                            </div>
                            {upcoming.length > 0 && (
                                <div className="mb-12">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Upcoming Fixtures</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                        {upcoming.map(match => <MatchCard key={match.id} match={match} teams={teams} onCardClick={(m) => setSelectedMatchId(m.id)} isGroupMode={false} showVenue={showVenue} />)}
                                    </div>
                                </div>
                            )}
                            {finished.length > 0 && (
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Final Results</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                        {finished.map(match => <MatchCard key={match.id} match={match} teams={teams} onCardClick={(m) => setSelectedMatchId(m.id)} isGroupMode={false} showVenue={showVenue} />)}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )
                }) : <p className="text-muted-foreground text-center py-20 font-bold uppercase tracking-widest text-xs opacity-30 italic">No matches scheduled for this season timeline.</p>}
            </div>
            {selectedMatchId && (
                <MatchDetailsDialog
                    matchId={selectedMatchId}
                    isOpen={!!selectedMatchId}
                    onClose={() => setSelectedMatchId(null)}
                />
            )}
        </div>
    );
}