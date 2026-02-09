
'use client';
import { createContext, useState, useEffect, useContext, useCallback, type ReactNode } from 'react';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, collection, addDoc, getDoc } from 'firebase/firestore';
import type { Season, MatchConfig, GlobalAnnouncement, MatchStage } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface SeasonContextState {
    seasons: Season[];
    currentSeason: Season | null;
    globalAnnouncement: GlobalAnnouncement | null;
    isLoggingEnabled: boolean;
    setCurrentSeason: (seasonId: string) => Promise<void>;
    createNextSeason: () => Promise<void>;
    deleteCurrentSeason: () => Promise<void>;
    updateMatchConfig: (newConfig: MatchConfig) => Promise<void>;
    updateGlobalAnnouncement: (announcement: GlobalAnnouncement) => Promise<void>;
    setLoggingEnabled: (enabled: boolean) => Promise<void>;
    loading: boolean;
}

const SeasonContext = createContext<SeasonContextState | undefined>(undefined);

export const SeasonProvider = ({ children }: { children: ReactNode }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [currentSeason, setInternalCurrentSeason] = useState<Season | null>(null);
    const [globalAnnouncement, setGlobalAnnouncement] = useState<GlobalAnnouncement | null>(null);
    const [isLoggingEnabled, setInternalLoggingEnabled] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;
        setLoading(true);
        const configRef = doc(firestore, 'config', 'app');
        const unsubscribe = onSnapshot(configRef, (snapshot) => {
            if (snapshot.exists()) {
                const configData = snapshot.data();
                const defaultMatchConfig: MatchConfig = { 
                    showGroupStage: true, 
                    showQuarterFinals: true, 
                    showOthers: false,
                    isGroupModeActive: false,
                    showVenue: true,
                    stageTimings: {}
                };
                const seasonList: Season[] = (configData.seasons || []).map((s: any) => ({
                    ...s,
                    matchConfig: {
                        ...defaultMatchConfig,
                        ...(s.matchConfig || {})
                    }
                }));
                setSeasons(seasonList);
                const current = seasonList.find(s => s.id === configData.currentSeasonId) || seasonList[0] || null;
                setInternalCurrentSeason(current);
                setGlobalAnnouncement(configData.globalAnnouncement || { message: '', isActive: false });
                setInternalLoggingEnabled(configData.isLoggingEnabled ?? true);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching season config:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    const logAction = useCallback(async (action: string, details: string) => {
        if (!firestore || !isLoggingEnabled) return;
        try {
            const savedUser = localStorage.getItem('dfpl_admin_session');
            const userObj = savedUser ? JSON.parse(savedUser) : null;
            const adminIdentity = userObj?.role === 'SYSTEM_ADMIN' ? 'SYS_ADMIN' : (userObj?.email?.split('@')[0] || 'Unknown');
            
            await addDoc(collection(firestore, 'logs'), {
                timestamp: Date.now(),
                adminEmail: adminIdentity,
                action,
                details
            });
        } catch (e) {}
    }, [firestore, isLoggingEnabled]);

    const setLoggingEnabled = useCallback(async (enabled: boolean) => {
        if (!firestore) return;
        const configRef = doc(firestore, 'config', 'app');
        updateDoc(configRef, { isLoggingEnabled: enabled }).then(() => {
            logAction("TOGGLE_LOGGING", `System Audit Logs ${enabled ? 'RESUMED' : 'PAUSED'}`);
        }).catch(async () => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update'
            }));
        });
    }, [firestore, logAction]);

    const setCurrentSeason = useCallback(async (seasonId: string) => {
        if (!firestore) return;
        const seasonName = seasons.find(s => s.id === seasonId)?.name || seasonId;
        const configRef = doc(firestore, 'config', 'app');
        updateDoc(configRef, { currentSeasonId: seasonId }).then(() => {
            logAction("SWITCH_SEASON", `Active scoping shifted to ${seasonName}`);
        }).catch(async () => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update',
                requestResourceData: { currentSeasonId: seasonId }
            }));
        });
    }, [firestore, logAction, seasons]);

    const updateGlobalAnnouncement = useCallback(async (announcement: GlobalAnnouncement) => {
        if (!firestore) return;
        const configRef = doc(firestore, 'config', 'app');
        const data = { globalAnnouncement: { ...announcement, updatedAt: Date.now() } };
        updateDoc(configRef, data).then(() => {
            logAction("BROADCAST_HUB", `Update: "${announcement.message}" (${announcement.isActive ? 'ACTIVE' : 'INACTIVE'})`);
            toast({ title: 'Broadcast Updated', description: 'The public announcement is now live.' });
        }).catch(async (error) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update',
                requestResourceData: data
            }));
        });
    }, [firestore, toast, logAction]);

    const createNextSeason = useCallback(async () => {
        if (!firestore || seasons.length === 0) return;
        const lastSeason = [...seasons].sort((a,b) => a.year - b.year)[seasons.length - 1];
        const lastSeasonNum = parseInt(lastSeason.name.split(' ')[1]);
        const newSeasonNum = lastSeasonNum + 1;
        const newSeason: Season = {
            id: `season-${newSeasonNum}`,
            name: `Season ${newSeasonNum}`,
            year: lastSeason.year + 1,
            matchConfig: {
                showGroupStage: true,
                showQuarterFinals: true,
                showOthers: false,
                isGroupModeActive: false,
                showVenue: true,
                stageTimings: {}
            },
        };
        const configRef = doc(firestore, 'config', 'app');
        updateDoc(configRef, {
            seasons: arrayUnion(newSeason),
            currentSeasonId: newSeason.id
        }).then(() => {
            logAction("CREATE_SEASON", `Deployed timeline for ${newSeason.name}`);
            toast({ title: 'Season Created', description: `${newSeason.name} has been created.` });
        }).catch(async () => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update'
            }));
        });
    }, [firestore, seasons, toast, logAction]);

    const deleteCurrentSeason = useCallback(async () => {
        if (!firestore || !currentSeason || seasons.length <= 1) return;
        const remainingSeasons = seasons.filter(s => s.id !== currentSeason.id);
        const newCurrentSeason = [...remainingSeasons].sort((a,b) => b.year - a.year)[0];
        const configRef = doc(firestore, 'config', 'app');
        updateDoc(configRef, { seasons: remainingSeasons, currentSeasonId: newCurrentSeason.id }).then(() => {
            logAction("DELETE_SEASON", `Permanently decommissioned ${currentSeason.name}`);
            toast({ title: 'Season Deleted', description: `${currentSeason.name} has been removed.` });
        }).catch(async () => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update'
            }));
        });
    }, [firestore, seasons, currentSeason, toast, logAction]);

    const updateMatchConfig = useCallback(async (newConfig: MatchConfig) => {
        if (!firestore || !currentSeason) return;
        const configRef = doc(firestore, 'config', 'app');
        const old = currentSeason.matchConfig;
        const logs: string[] = [];
        
        if (old.isGroupModeActive !== newConfig.isGroupModeActive) logs.push(newConfig.isGroupModeActive ? "ENABLED Group Mode" : "DISABLED Group Mode");
        if (JSON.stringify(old.stageTimings) !== JSON.stringify(newConfig.stageTimings)) {
            logs.push("Modified Match Timings");
        }

        const details = logs.length > 0 ? `Scoping updates for ${currentSeason.name}: ${logs.join(', ')}` : `Modified stage settings for ${currentSeason.name}`;
        const updatedSeasons = seasons.map(s => s.id === currentSeason.id ? { ...s, matchConfig: newConfig } : s);

        updateDoc(configRef, { seasons: updatedSeasons }).then(() => {
            logAction("MATCH_CONFIG", details);
        }).catch(async () => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update'
            }));
        });
    }, [firestore, seasons, currentSeason, logAction]);

    const value = { seasons, currentSeason, globalAnnouncement, isLoggingEnabled, setCurrentSeason, createNextSeason, deleteCurrentSeason, updateMatchConfig, updateGlobalAnnouncement, setLoggingEnabled, loading };
    return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
};

export const useSeason = (): SeasonContextState => {
    const context = useContext(SeasonContext);
    if (context === undefined) throw new Error('useSeason must be used within a SeasonProvider');
    return context;
};
