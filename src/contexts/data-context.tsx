'use client';

import { createContext, ReactNode, useMemo, useCallback } from 'react';
import type { Player, Team, Match, MatchEvent, MatchStage } from '@/types';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs, Timestamp, increment, getDoc, arrayRemove, arrayUnion, addDoc, type DocumentReference, type Firestore, type WriteBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useSeason } from './season-context';
import { useAuth } from '@/hooks/use-auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import * as XLSX from 'xlsx';
import { randomPlaceholderIndex } from '@/lib/utils';

export interface DataContextState {
  players: Player[];
  teams: Team[];
  matches: Match[];
  loading: boolean;
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => Promise<void>;
  deletePlayer: (playerId: string) => void;
  addTeam: (team: Team) => void;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => void;
  addMatch: (match: Match) => void;
  updateMatch: (match: Match) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  addMatchEvent: (matchId: string, event: Omit<MatchEvent, 'id'> & { id?: string }, assisterId?: string) => Promise<void>;
  updateMatchEvent: (matchId: string, eventId: string, newEventData: Omit<MatchEvent, 'id'> & { assisterId?: string }) => Promise<void>;
  deleteMatchEvent: (matchId: string, eventId: string) => Promise<void>;
  updateMatchStatus: (matchId: string, newStatus: Match['status']) => Promise<void>;
  resetSeasonStats: () => Promise<void>;
  wipeSeasonData: () => Promise<void>;
  importSeasonPreset: (sourceSeasonId: string) => Promise<void>;
  resetGroups: () => Promise<void>;
  logAction: (action: string, details: string) => void;
  bulkImportData: (file: File) => Promise<void>;
}

export const DataContext = createContext<DataContextState | undefined>(undefined);

const convertTimestamps = (data: any[]) => {
    return data.map(item => {
        const newItem = { ...item };
        for (const key in newItem) {
            if (newItem[key] instanceof Timestamp) {
                newItem[key] = newItem[key].toDate();
            }
        }
        return newItem;
    });
}

const applyStatChange = (batch: any, firestore: any, seasonId: string, match: Match, event: MatchEvent, factor: 1 | -1) => {
    const playerRef = doc(firestore, 'seasons', seasonId, 'players', event.playerId);
    const teamRef = doc(firestore, 'seasons', seasonId, 'teams', event.teamId);
    const isHomeEvent = event.teamId === match.homeTeamId;
    const opponentTeamId = isHomeEvent ? match.awayTeamId : match.homeTeamId;
    const opponentTeamRef = doc(firestore, 'seasons', seasonId, 'teams', opponentTeamId);

    switch (event.type) {
        case 'Goal':
            batch.update(playerRef, { goals: increment(factor) });
            batch.update(teamRef, { 'stats.totalGoals': increment(factor) });
            batch.update(opponentTeamRef, { 'stats.goalsAgainst': increment(factor) });
            break;
        case 'Assist':
            batch.update(playerRef, { assists: increment(factor) });
            batch.update(teamRef, { 'stats.totalAssists': increment(factor) });
            break;
        case 'Yellow Card':
            batch.update(playerRef, { yellowCards: increment(factor) });
            batch.update(teamRef, { 'stats.totalYellowCards': increment(factor) });
            break;
        case 'Red Card':
            batch.update(playerRef, { redCards: increment(factor) });
            batch.update(teamRef, { 'stats.totalRedCards': increment(factor) });
            break;
        case 'Own Goal':
            batch.update(teamRef, { 'stats.goalsAgainst': increment(factor) });
            batch.update(opponentTeamRef, { 'stats.totalGoals': increment(factor) });
            break;
    }
};

// Goals count for the scorer's side; own goals for the other side.
const applyScoreChange = (batch: WriteBatch, matchRef: DocumentReference, match: Match, event: MatchEvent, factor: 1 | -1) => {
    if (event.type !== 'Goal' && event.type !== 'Own Goal') return;
    let forHome = event.teamId === match.homeTeamId;
    if (event.type === 'Own Goal') forHome = !forHome;
    batch.update(matchRef, { [forHome ? 'homeScore' : 'awayScore']: increment(factor) });
};

// Firestore caps a batch at 500 writes — spread them over batches of 200 and
// commit those one after another, in order, stopping at the first failure.
const MAX_BATCH_OPS = 200;
const commitInChunks = (firestore: Firestore, writes: ((batch: WriteBatch) => void)[]): Promise<void> => {
    const batches: WriteBatch[] = [];
    writes.forEach((write, i) => {
        if (i % MAX_BATCH_OPS === 0) batches.push(writeBatch(firestore));
        write(batches.at(-1)!);
    });
    return batches.reduce<Promise<void>>((prev, batch) => prev.then(() => batch.commit()), Promise.resolve());
};

const EMPTY_TEAM_STATS = { totalGoals: 0, totalAssists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, matchesDrawn: 0, goalsAgainst: 0, totalYellowCards: 0, totalRedCards: 0 };
const EMPTY_PLAYER_STATS = { goals: 0, assists: 0, matchesPlayed: 0, yellowCards: 0, redCards: 0 };

// Excel stores dates as serial numbers (days since 1899-12-30); text dates are parsed as-is.
const parseExcelDate = (rawDate: unknown): Date => {
    if (typeof rawDate === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + rawDate * 86400000);
    }
    return new Date(rawDate as string);
};

// Doc-ID suffix — not a secret, but crypto-backed anyway.
const randomSuffix = () => crypto.randomUUID().replaceAll('-', '').substring(0, 7);

const teamFromRow = (row: any): Partial<Team> => ({
    name: row['Team Name'],
    owner: row['Owner'],
    logoUrl: `team-logo-${randomPlaceholderIndex()}`,
    group: row['Group'] || 'None',
    stats: {
        matchesPlayed: row['Matches Played'] || 0,
        matchesWon: row['Won'] || 0,
        matchesDrawn: row['Drawn'] || 0,
        matchesLost: row['Lost'] || 0,
        totalGoals: row['Goals Scored'] || 0,
        goalsAgainst: row['Goals Against'] || 0,
        totalAssists: row['Total Assists'] || 0,
        totalYellowCards: row['Yellow Cards'] || 0,
        totalRedCards: row['Red Cards'] || 0
    }
});

const playerFromRow = (row: any, teamId: string): Partial<Player> => ({
    name: row['Name'],
    teamId,
    category: row['Category'] || 'C',
    age: row['Age'] !== 'N/A' ? Number(row['Age']) : 0,
    preferredPosition: row['Position'] !== 'N/A' ? row['Position'].split(', ') : [],
    matchesPlayed: row['Matches Played'] || 0,
    goals: row['Goals'] || 0,
    assists: row['Assists'] || 0,
    yellowCards: row['Yellow Cards'] || 0,
    redCards: row['Red Cards'] || 0,
    avatarUrl: `player-avatar-${randomPlaceholderIndex()}`
});

const updateTeamStatsForOutcome = (batch: any, firestore: any, seasonId: string, match: Match, factor: 1 | -1) => {
    const homeTeamRef = doc(firestore, 'seasons', seasonId, 'teams', match.homeTeamId);
    const awayTeamRef = doc(firestore, 'seasons', seasonId, 'teams', match.awayTeamId);
    const hScore = match.homeScore ?? 0;
    const aScore = match.awayScore ?? 0;

    batch.update(homeTeamRef, { 'stats.matchesPlayed': increment(factor) });
    batch.update(awayTeamRef, { 'stats.matchesPlayed': increment(factor) });

    if (hScore > aScore) {
        batch.update(homeTeamRef, { 'stats.matchesWon': increment(factor) });
        batch.update(awayTeamRef, { 'stats.matchesLost': increment(factor) });
    } else if (hScore < aScore) {
        batch.update(homeTeamRef, { 'stats.matchesLost': increment(factor) });
        batch.update(awayTeamRef, { 'stats.matchesWon': increment(factor) });
    } else {
        batch.update(homeTeamRef, { 'stats.matchesDrawn': increment(factor) });
        batch.update(awayTeamRef, { 'stats.matchesDrawn': increment(factor) });
    }
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentSeason, loading: seasonLoading, isLoggingEnabled } = useSeason();
  const seasonId = currentSeason?.id;

  const playersPath = seasonId ? `seasons/${seasonId}/players` : '';
  const teamsPath = seasonId ? `seasons/${seasonId}/teams` : '';
  const matchesPath = seasonId ? `seasons/${seasonId}/matches` : '';

  const { data: playersData, loading: playersLoading } = useCollection<Player>(playersPath);
  const { data: teamsData, loading: teamsLoading } = useCollection<Team>(teamsPath);
  const { data: matchesData, loading: matchesLoading } = useCollection<Match>(matchesPath);

  const loading = playersLoading || teamsLoading || matchesLoading || seasonLoading;
  
  const players = useMemo(() => convertTimestamps(playersData), [playersData]);
  const teams = useMemo(() => convertTimestamps(teamsData), [teamsData]);
  const matches = useMemo(() => convertTimestamps(matchesData), [matchesData]);

  const getTeamName = useCallback((tid: string) => teams.find(t => t.id === tid)?.name || tid, [teams]);
  const getPlayerName = useCallback((pid: string) => players.find(p => p.id === pid)?.name || pid, [players]);

  // Fire-and-forget: the audit write never delays or fails the admin action.
  const logAction = useCallback((action: string, details: string) => {
    if (!firestore || !isLoggingEnabled || !user) return;
    const adminIdentity = user.role === 'SYSTEM_ADMIN' ? 'SYS_ADMIN' : user.email.split('@')[0];
    const logRef = collection(firestore, 'logs');
    addDoc(logRef, {
        timestamp: Date.now(),
        adminEmail: adminIdentity,
        action,
        details
    }).catch(() => {});
  }, [firestore, isLoggingEnabled, user]);

  const addPlayer = useCallback((player: Player) => {
    if (!firestore || !seasonId) return;
    const { id, ...playerData } = player;
    const docRef = doc(firestore, 'seasons', seasonId, 'players', id);
    setDoc(docRef, playerData).then(() => {
        logAction("ADD_PLAYER", `Registered athlete: ${player.name} to ${getTeamName(player.teamId)}`);
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: playerData
      }));
    });
  }, [firestore, seasonId, logAction, getTeamName]);

  const updatePlayer = useCallback(async (player: Player) => {
    if (!firestore || !seasonId) return;
    const { id, ...playerData } = player;
    const docRef = doc(firestore, 'seasons', seasonId, 'players', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const old = snap.data() as Player;

    const changes: string[] = [];
    if (old.name !== player.name) changes.push(`name: "${old.name}" -> "${player.name}"`);
    if (old.teamId !== player.teamId) {
        changes.push(`club: ${getTeamName(old.teamId)} -> ${getTeamName(player.teamId)}`);
    }
    if (old.category !== player.category) changes.push(`class: ${old.category} -> ${player.category}`);
    if (old.age !== player.age) changes.push(`age: ${old.age || 'N/A'} -> ${player.age}`);
    if (JSON.stringify(old.preferredPosition) !== JSON.stringify(player.preferredPosition)) {
        changes.push(`position: [${old.preferredPosition?.join(', ') || 'N/A'}] -> [${player.preferredPosition?.join(', ')}]`);
    }
    
    const details = changes.length > 0 ? `Modified profile for ${player.name} (${changes.join(', ')})` : `Modified profile for ${player.name}`;

    updateDoc(docRef, playerData).then(() => {
        logAction("UPDATE_PLAYER", details);
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: playerData
      }));
    });
  }, [firestore, seasonId, logAction, getTeamName]);

  const deletePlayer = useCallback((playerId: string) => {
    if (!firestore || !seasonId) return;
    const playerName = getPlayerName(playerId);
    const docRef = doc(firestore, 'seasons', seasonId, 'players', playerId);
    deleteDoc(docRef).then(() => {
        logAction("DELETE_PLAYER", `Decommissioned athlete: ${playerName}`);
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
  }, [firestore, seasonId, logAction, getPlayerName]);

  const addTeam = useCallback((team: Team) => {
    if (!firestore || !seasonId) return;
    const { id, ...teamData } = team;
    const docRef = doc(firestore, 'seasons', seasonId, 'teams', id);
    setDoc(docRef, teamData).then(() => {
        logAction("ADD_TEAM", `Deployed new club: ${team.name}`);
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: teamData
      }));
    });
  }, [firestore, seasonId, logAction]);

  const updateTeam = useCallback(async (team: Team) => {
    if (!firestore || !seasonId) return;
    const { id, ...teamData } = team;
    const docRef = doc(firestore, 'seasons', seasonId, 'teams', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const old = snap.data() as Team;

    const changes: string[] = [];
    if (old.name !== team.name) changes.push(`name: "${old.name}" -> "${team.name}"`);
    if (old.owner !== team.owner) changes.push(`owner: "${old.owner}" -> "${team.owner}"`);
    
    const oldGrp = (old.group && old.group !== 'None') ? old.group : 'None';
    const newGrp = (team.group && team.group !== 'None') ? team.group : 'None';
    if (oldGrp !== newGrp) changes.push(`group: ${oldGrp} -> ${newGrp}`);
    
    const os = old.stats;
    const ns = team.stats;
    if (os.matchesPlayed !== ns.matchesPlayed) changes.push(`MP: ${os.matchesPlayed} -> ${ns.matchesPlayed}`);
    if (os.matchesWon !== ns.matchesWon) changes.push(`W: ${os.matchesWon} -> ${ns.matchesWon}`);
    if (os.totalGoals !== ns.totalGoals) changes.push(`GF: ${os.totalGoals} -> ${ns.totalGoals}`);

    const details = changes.length > 0 ? `Updated club ${team.name} (${changes.join(', ')})` : `Updated club ${team.name}`;

    updateDoc(docRef, teamData).then(() => {
        logAction("UPDATE_TEAM", details);
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: teamData
      }));
    });
  }, [firestore, seasonId, logAction]);

  const deleteTeam = useCallback((teamId: string) => {
    if (!firestore || !seasonId) return;
    const teamName = getTeamName(teamId);
    const docRef = doc(firestore, 'seasons', seasonId, 'teams', teamId);
    deleteDoc(docRef).then(() => {
        logAction("DELETE_TEAM", `Terminated club: ${teamName}`);
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
  }, [firestore, seasonId, logAction, getTeamName]);

  const addMatch = useCallback((match: Match) => {
    if (!firestore || !seasonId) return;
    const { id, ...matchData } = match;
    const dataWithTimestamp = { ...matchData, date: Timestamp.fromDate(new Date(matchData.date as string)) };
    const docRef = doc(firestore, 'seasons', seasonId, 'matches', id);
    setDoc(docRef, dataWithTimestamp).then(() => {
        logAction("SCHEDULE_MATCH", `Scheduled fixture: ${getTeamName(match.homeTeamId)} vs ${getTeamName(match.awayTeamId)}`);
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create'
      }));
    });
  }, [firestore, seasonId, logAction, getTeamName]);

  const updateMatch = useCallback(async (updatedMatch: Match) => {
    if (!firestore || !seasonId) return;
    const matchRef = doc(firestore, 'seasons', seasonId, 'matches', updatedMatch.id);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) return;
    const old = { id: matchSnap.id, ...matchSnap.data() } as Match;

    const batch = writeBatch(firestore);
    if (updatedMatch.status !== old.status) {
        if (updatedMatch.status === 'FINISHED') updateTeamStatsForOutcome(batch, firestore, seasonId, updatedMatch, 1);
        if (old.status === 'FINISHED') updateTeamStatsForOutcome(batch, firestore, seasonId, old, -1);
    }

    const { id, ...matchData } = updatedMatch;
    const dataToSave = { 
        ...matchData, 
        date: updatedMatch.date instanceof Date ? Timestamp.fromDate(updatedMatch.date) : Timestamp.fromDate(new Date(updatedMatch.date as string)) 
    };
    batch.update(matchRef, dataToSave);

    const changes: string[] = [];
    if (old.status !== updatedMatch.status) changes.push(`status: ${old.status} -> ${updatedMatch.status}`);
    if (old.isExtraTime !== updatedMatch.isExtraTime) changes.push(updatedMatch.isExtraTime ? "Extra Time INITIATED" : "Extra Time RESET");
    if (old.stage !== updatedMatch.stage) changes.push(`stage: ${old.stage} -> ${updatedMatch.stage}`);
    if (old.time !== updatedMatch.time) changes.push(`time: ${old.time} -> ${updatedMatch.time}`);
    if (old.venue !== updatedMatch.venue) changes.push(`venue: ${old.venue} -> ${updatedMatch.venue}`);

    const details = `Match update [${getTeamName(updatedMatch.homeTeamId)} vs ${getTeamName(updatedMatch.awayTeamId)}]: ${changes.join(', ')}`;

    await batch.commit().then(() => {
        logAction("UPDATE_MATCH", details);
    }).catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: matchRef.path,
            operation: 'update'
        }));
    });
  }, [firestore, seasonId, getTeamName, logAction]);

  const deleteMatch = useCallback(async (matchId: string) => {
    if (!firestore || !seasonId) return;
    const matchRef = doc(firestore, 'seasons', seasonId, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    if (matchSnap.exists()) {
        const matchData = { id: matchSnap.id, ...matchSnap.data() } as Match;
        const batch = writeBatch(firestore);
        if (matchData.status === 'FINISHED') updateTeamStatsForOutcome(batch, firestore, seasonId, matchData, -1);
        if (matchData.events) matchData.events.forEach(e => applyStatChange(batch, firestore, seasonId, matchData, e, -1));
        batch.delete(matchRef);
        batch.commit().then(() => {
            logAction("DELETE_MATCH", `Erased match: ${getTeamName(matchData.homeTeamId)} vs ${getTeamName(matchData.awayTeamId)}`);
        }).catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: matchRef.path,
                operation: 'delete'
            }));
        });
    }
  }, [firestore, seasonId, logAction, getTeamName]);

  const addMatchEvent = useCallback(async (matchId: string, event: Omit<MatchEvent, 'id'> & { id?: string }, assisterId?: string) => {
    if (!firestore || !seasonId) return;
    const matchRef = doc(firestore, 'seasons', seasonId, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) return;
    const match = { id: matchSnap.id, ...matchSnap.data() } as Match;

    const eventId = event.id || `evt-${Date.now()}`;
    const fullEvent = { ...event, id: eventId } as MatchEvent;

    const batch = writeBatch(firestore);
    batch.update(matchRef, { events: arrayUnion(fullEvent) });

    applyScoreChange(batch, matchRef, match, fullEvent, 1);
    applyStatChange(batch, firestore, seasonId, match, fullEvent, 1);

    // Handle assist in the same atomic batch to prevent race conditions
    if (event.type === 'Goal' && assisterId && assisterId !== 'none') {
        const assister = playersData.find(p => p.id === assisterId);
        if (assister) {
            const assistEvent: MatchEvent = {
                id: `${eventId}-ast`,
                type: 'Assist',
                minute: fullEvent.minute,
                playerId: assister.id,
                teamId: assister.teamId,
                playerName: assister.name,
                linkedGoalId: eventId
            };
            batch.update(matchRef, { events: arrayUnion(assistEvent) });
            applyStatChange(batch, firestore, seasonId, match, assistEvent, 1);
        }
    }

    // Auto-issue Red Card on second Yellow Card for the same player in this match
    if (event.type === 'Yellow Card') {
        const existingYellows = (match.events || []).filter(
            e => e.type === 'Yellow Card' && e.playerId === event.playerId
        );
        if (existingYellows.length >= 1) {
            const redCardEvent: MatchEvent = {
                id: `${eventId}-2yc-red`,
                type: 'Red Card',
                minute: fullEvent.minute,
                playerId: event.playerId,
                teamId: event.teamId,
                playerName: event.playerName,
            };
            batch.update(matchRef, { events: arrayUnion(redCardEvent) });
            applyStatChange(batch, firestore, seasonId, match, redCardEvent, 1);
        }
    }

    await batch.commit().then(() => {
        logAction("ADD_MATCH_EVENT", `Recorded ${event.type} for ${event.playerName} in Match: ${getTeamName(match.homeTeamId)} vs ${getTeamName(match.awayTeamId)}`);
        toast({ title: 'Event Added', description: `${event.type} recorded successfully.` });
    });
  }, [firestore, seasonId, logAction, getTeamName, toast, playersData]);

  const updateMatchEvent = useCallback(async (matchId: string, eventId: string, newEventData: Omit<MatchEvent, 'id'> & { assisterId?: string }) => {
    if (!firestore || !seasonId) return;
    const matchRef = doc(firestore, 'seasons', seasonId, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) return;
    const match = { id: matchSnap.id, ...matchSnap.data() } as Match;

    const oldEvent = match.events?.find(e => e.id === eventId);
    if (!oldEvent) return;

    const batch = writeBatch(firestore);
    const updatedEvents = match.events?.filter(e => e.id !== eventId) || [];
    
    const { assisterId, ...cleanEventData } = newEventData;
    const updatedEvent = { ...cleanEventData, id: eventId } as MatchEvent;
    
    applyScoreChange(batch, matchRef, match, oldEvent, -1);
    applyStatChange(batch, firestore, seasonId, match, oldEvent, -1);

    applyScoreChange(batch, matchRef, match, updatedEvent, 1);
    applyStatChange(batch, firestore, seasonId, match, updatedEvent, 1);

    const oldAssistIndex = updatedEvents.findIndex(e => e.linkedGoalId === eventId);
    if (oldAssistIndex !== -1) {
        const oldAssist = updatedEvents[oldAssistIndex];
        applyStatChange(batch, firestore, seasonId, match, oldAssist, -1);
        updatedEvents.splice(oldAssistIndex, 1);
    }

    if (updatedEvent.type === 'Goal' && assisterId && assisterId !== 'none') {
        const assister = playersData.find(p => p.id === assisterId);
        if (assister) {
            const newAssist: MatchEvent = {
                id: `evt-${Date.now()}-ast`,
                type: 'Assist',
                minute: updatedEvent.minute,
                playerId: assister.id,
                teamId: assister.teamId,
                playerName: assister.name,
                linkedGoalId: eventId
            };
            updatedEvents.push(newAssist);
            applyStatChange(batch, firestore, seasonId, match, newAssist, 1);
        }
    }

    updatedEvents.push(updatedEvent);
    batch.update(matchRef, { events: updatedEvents });

    await batch.commit().then(() => {
        logAction("UPDATE_MATCH_EVENT", `Modified ${updatedEvent.type} for ${updatedEvent.playerName} in Match: ${getTeamName(match.homeTeamId)} vs ${getTeamName(match.awayTeamId)}`);
        toast({ title: 'Event Updated', description: 'Match timeline record updated.' });
    });
  }, [firestore, seasonId, logAction, getTeamName, toast, playersData]);

  const deleteMatchEvent = useCallback(async (matchId: string, eventId: string) => {
    if (!firestore || !seasonId) return;
    const matchRef = doc(firestore, 'seasons', seasonId, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) return;
    const match = { id: matchSnap.id, ...matchSnap.data() } as Match;

    const event = match.events?.find(e => e.id === eventId);
    if (!event) return;

    const batch = writeBatch(firestore);
    const linkedAssist = match.events?.find(e => e.linkedGoalId === eventId);
    if (linkedAssist) {
        batch.update(matchRef, { events: arrayRemove(linkedAssist) });
        applyStatChange(batch, firestore, seasonId, match, linkedAssist, -1);
    }

    batch.update(matchRef, { events: arrayRemove(event) });

    applyScoreChange(batch, matchRef, match, event, -1);
    applyStatChange(batch, firestore, seasonId, match, event, -1);

    // If a Yellow Card is removed, check if the auto-issued Red Card should also be removed
    if (event.type === 'Yellow Card') {
        const remainingYellows = (match.events || []).filter(
            e => e.type === 'Yellow Card' && e.playerId === event.playerId && e.id !== eventId
        );
        if (remainingYellows.length < 2) {
            const autoRedCard = (match.events || []).find(
                e => e.type === 'Red Card' && e.playerId === event.playerId && e.id.endsWith('-2yc-red')
            );
            if (autoRedCard) {
                batch.update(matchRef, { events: arrayRemove(autoRedCard) });
                applyStatChange(batch, firestore, seasonId, match, autoRedCard, -1);
            }
        }
    }

    await batch.commit().then(() => {
        logAction("DELETE_MATCH_EVENT", `Removed ${event.type} for ${event.playerName} in Match: ${getTeamName(match.homeTeamId)} vs ${getTeamName(match.awayTeamId)}`);
        toast({ title: 'Event Removed', description: 'Action reverted from match history.' });
    });
  }, [firestore, seasonId, logAction, getTeamName, toast]);

  const updateMatchStatus = useCallback(async (matchId: string, newStatus: Match['status']) => {
    if (!firestore || !seasonId) return;
    const matchRef = doc(firestore, 'seasons', seasonId, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) return;
    const matchData = { id: matchSnap.id, ...matchSnap.data() } as Match;

    const batch = writeBatch(firestore);
    if (newStatus !== matchData.status) {
        if (newStatus === 'FINISHED') updateTeamStatsForOutcome(batch, firestore, seasonId, matchData, 1);
        if (matchData.status === 'FINISHED') updateTeamStatsForOutcome(batch, firestore, seasonId, matchData, -1);
    }

    batch.update(matchRef, { status: newStatus });

    await batch.commit().then(() => {
        logAction("UPDATE_MATCH_STATUS", `Changed Match Status to ${newStatus}: ${getTeamName(matchData.homeTeamId)} vs ${getTeamName(matchData.awayTeamId)}`);
        toast({ title: 'Status Updated', description: `Match is now ${newStatus}.` });
    });
  }, [firestore, seasonId, logAction, getTeamName, toast]);

  const resetSeasonStats = useCallback(async () => {
    if (!firestore || !seasonId) return;
    await commitInChunks(firestore, [
        ...teams.map(t => (b: WriteBatch) => b.update(doc(firestore, 'seasons', seasonId, 'teams', t.id), {
            stats: EMPTY_TEAM_STATS
        })),
        ...players.map(p => (b: WriteBatch) => b.update(doc(firestore, 'seasons', seasonId, 'players', p.id), EMPTY_PLAYER_STATS)),
        ...matches.map(m => (b: WriteBatch) => b.update(doc(firestore, 'seasons', seasonId, 'matches', m.id), {
            status: 'UPCOMING', homeScore: 0, awayScore: 0, events: [], isExtraTime: false
        })),
    ]);

    logAction("RESET_SEASON", `Purged all performance metrics for ${currentSeason?.name}`);
    toast({ title: 'Stats Reset', description: 'Season performance logs have been zeroed.' });
  }, [firestore, seasonId, teams, players, matches, logAction, currentSeason, toast]);

  const wipeSeasonData = useCallback(async () => {
    if (!firestore || !seasonId) return;
    await commitInChunks(firestore, [
        ...players.map(p => (b: WriteBatch) => b.delete(doc(firestore, 'seasons', seasonId, 'players', p.id))),
        ...teams.map(t => (b: WriteBatch) => b.delete(doc(firestore, 'seasons', seasonId, 'teams', t.id))),
        ...matches.map(m => (b: WriteBatch) => b.delete(doc(firestore, 'seasons', seasonId, 'matches', m.id))),
    ]);

    logAction("WIPE_SEASON", `Permanently erased all registries and fixtures for ${currentSeason?.name}`);
    toast({ title: 'Data Wiped', description: 'All season records have been deleted.' });
  }, [firestore, seasonId, players, teams, matches, logAction, currentSeason, toast]);

  const importSeasonPreset = useCallback(async (sourceSeasonId: string) => {
    if (!firestore || !seasonId) return;
    try {
        const sourceTeams = await getDocs(collection(firestore, 'seasons', sourceSeasonId, 'teams'));
        const sourcePlayers = await getDocs(collection(firestore, 'seasons', sourceSeasonId, 'players'));

        const sourceName = (await getDoc(doc(firestore, 'config', 'app'))).data()?.seasons?.find((s: any) => s.id === sourceSeasonId)?.name || sourceSeasonId;

        await commitInChunks(firestore, [
            ...sourceTeams.docs.map(tDoc => (b: WriteBatch) => {
                const { id, ...data } = tDoc.data() as Team;
                b.set(doc(firestore, 'seasons', seasonId, 'teams', tDoc.id), { ...data, stats: EMPTY_TEAM_STATS });
            }),
            ...sourcePlayers.docs.map(pDoc => (b: WriteBatch) => {
                const { id, ...data } = pDoc.data() as Player;
                b.set(doc(firestore, 'seasons', seasonId, 'players', pDoc.id), { ...data, ...EMPTY_PLAYER_STATS });
            }),
        ]);

        logAction("IMPORT_DATA", `Migrated rosters from ${sourceName} into ${currentSeason?.name} (${sourceTeams.size} teams, ${sourcePlayers.size} players)`);
        toast({ title: 'Import Complete', description: `Rosters migrated from ${sourceName} successfully.` });
    } catch (error: any) {
        console.error('Import failed:', error);
        toast({ variant: 'destructive', title: 'Import Failed', description: error.message });
    }
  }, [firestore, seasonId, logAction, currentSeason, toast]);

  const bulkImportData = useCallback(async (file: File) => {
    if (!firestore || !seasonId) return;

    try {
        const data = new Uint8Array(await file.arrayBuffer());
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetNames = workbook.SheetNames;

        const requiredSheets = ["Standings", "Team Stats", "Players", "Matches"];
        const missingSheet = requiredSheets.find(sheet => !sheetNames.includes(sheet));
        if (missingSheet) {
            toast({ variant: 'destructive', title: 'Invalid File', description: `Required sheet "${missingSheet}" is missing from the Excel file.` });
            return;
        }

        const teamStatsSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Team Stats"]);
        const playersSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Players"]);
        const matchesSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Matches"]);

        const writes: ((batch: WriteBatch) => void)[] = [];
        const teamMap: Record<string, string> = {}; // Name -> ID

        teamStatsSheet.forEach((row: any, index) => {
            const teamId = `t${Date.now()}-${index}-${randomSuffix()}`;
            teamMap[row['Team Name']] = teamId;
            const teamData = teamFromRow(row);
            writes.push(b => b.set(doc(firestore, 'seasons', seasonId, 'teams', teamId), teamData));
        });

        playersSheet.forEach((row: any, index) => {
            const playerId = `p${Date.now()}-${index}-${randomSuffix()}`;
            const playerData = playerFromRow(row, teamMap[row['Team']] || 'unassigned');
            writes.push(b => b.set(doc(firestore, 'seasons', seasonId, 'players', playerId), playerData));
        });

        matchesSheet.forEach((row: any, index) => {
            const matchId = `m${Date.now()}-${index}-${randomSuffix()}`;
            const homeTeamId = teamMap[row['Home Team']];
            const awayTeamId = teamMap[row['Away Team']];
            if (!homeTeamId || !awayTeamId) return;

            const parsedDate = parseExcelDate(row['Date']);
            if (Number.isNaN(parsedDate.getTime())) {
                console.warn(`Skipping match at row ${index}: invalid date "${row['Date']}"`);
                return;
            }

            const matchData = {
                date: Timestamp.fromDate(parsedDate),
                time: row['Time'],
                stage: row['Stage'] as MatchStage,
                homeTeamId,
                awayTeamId,
                homeScore: row['Home Score'] || 0,
                awayScore: row['Away Score'] || 0,
                status: row['Status'] as any,
                venue: row['Venue'] || 'TBD',
                events: []
            };
            writes.push(b => b.set(doc(firestore, 'seasons', seasonId, 'matches', matchId), matchData));
        });

        await commitInChunks(firestore, writes);

        logAction("BULK_IMPORT", `Overwrote season registry via Excel ingestion.`);
        toast({ title: 'Success', description: 'Tournament data imported successfully.' });
    } catch (error: any) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not parse Excel data. Check console for details.' });
    }
  }, [firestore, seasonId, logAction, toast]);

  const resetGroups = useCallback(async () => {
    if (!firestore || !seasonId) return;
    const batch = writeBatch(firestore);
    teams.forEach(t => {
        batch.update(doc(firestore, 'seasons', seasonId, 'teams', t.id), { group: 'None' });
    });
    await batch.commit().then(() => {
        logAction("RESET_GROUPS", `Reverted all club group assignments to standalone for ${currentSeason?.name}`);
        toast({ title: 'Groups Reset', description: 'All teams are now unassigned.' });
    });
  }, [firestore, seasonId, teams, logAction, currentSeason, toast]);

  const value: DataContextState = useMemo(() => ({
    players, teams, matches, loading, addPlayer, updatePlayer, deletePlayer, addTeam, updateTeam, deleteTeam, addMatch, updateMatch, deleteMatch, logAction,
    addMatchEvent, updateMatchEvent, deleteMatchEvent, updateMatchStatus, resetSeasonStats, wipeSeasonData, importSeasonPreset, resetGroups, bulkImportData
  }), [players, teams, matches, loading, addPlayer, updatePlayer, deletePlayer, addTeam, updateTeam, deleteTeam, addMatch, updateMatch, deleteMatch, logAction,
    addMatchEvent, updateMatchEvent, deleteMatchEvent, updateMatchStatus, resetSeasonStats, wipeSeasonData, importSeasonPreset, resetGroups, bulkImportData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
