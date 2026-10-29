
'use client';
import { createContext, useState, useEffect, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, collection, addDoc } from 'firebase/firestore';
import type { Season, MatchConfig, GlobalAnnouncement } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface SeasonContextState {
    seasons: Season[];
    currentSeason: Season | null;
    globalAnnouncement: GlobalAnnouncement | null;
    isLoggingEnabled: boolean;
    isSessionActive: boolean;
    setCurrentSeason: (seasonId: string) => Promise<void>;
    createNextSeason: () => Promise<void>;
    deleteCurrentSeason: () => Promise<void>;
    updateMatchConfig: (newConfig: MatchConfig) => Promise<void>;
    updateGlobalAnnouncement: (announcement: GlobalAnnouncement) => Promise<void>;
    updateManagementImages: (images: string[]) => Promise<void>;
    setLoggingEnabled: (enabled: boolean) => Promise<void>;
    setSessionActive: (enabled: boolean) => Promise<void>;
    managementImages: string[];
    loading: boolean;
}

const SeasonContext = createContext<SeasonContextState | undefined>(undefined);

export const SeasonProvider = ({ children }: { children: ReactNode }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [activeSeason, setActiveSeason] = useState<Season | null>(null);
    const [globalAnnouncement, setGlobalAnnouncement] = useState<GlobalAnnouncement | null>(null);
    const [isLoggingEnabled, setIsLoggingEnabled] = useState(true);
    const [isSessionActive, setIsSessionActive] = useState(true);
    const [managementImages, setManagementImages] = useState<string[]>([]);
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
                        ...s.matchConfig
                    }
                }));
                setSeasons(seasonList);
                const current = seasonList.find(s => s.id === configData.currentSeasonId) || seasonList[0] || null;
                setActiveSeason(current);
                setGlobalAnnouncement(configData.globalAnnouncement || { message: '', isActive: false });
                setIsLoggingEnabled(configData.isLoggingEnabled ?? true);
                setIsSessionActive(configData.isSessionActive ?? true);
                setManagementImages(configData.managementImages || []);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching season config:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    // Fire-and-forget audit log: a failed write (or unreadable session) never blocks the admin action.
    const logAction = useCallback((action: string, details: string) => {
        if (!firestore || !isLoggingEnabled) return;
        let userObj: any;
        try {
            const savedUser = localStorage.getItem('dfpl_admin_session');
            userObj = savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return; // unreadable session: skip the log entry, as before
        }
        const adminIdentity = userObj?.role === 'SYSTEM_ADMIN' ? 'SYS_ADMIN' : (userObj?.email?.split('@')[0] || 'Unknown');
        addDoc(collection(firestore, 'logs'), {
            timestamp: Date.now(),
            adminEmail: adminIdentity,
            action,
            details
        }).catch(() => {});
    }, [firestore, isLoggingEnabled]);

    const setLoggingEnabled = useCallback(async (enabled: boolean) => {
        if (!firestore) return;
        const configRef = doc(firestore, 'config', 'app');
        await updateDoc(configRef, { isLoggingEnabled: enabled }).then(() => {
            logAction("TOGGLE_LOGGING", `System Audit Logs ${enabled ? 'RESUMED' : 'PAUSED'}`);
        }).catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update'
            }));
        });
    }, [firestore, logAction]);

    const setSessionActive = useCallback(async (enabled: boolean) => {
        if (!firestore) return;
        const configRef = doc(firestore, 'config', 'app');
        await updateDoc(configRef, { isSessionActive: enabled }).then(() => {
            logAction("SESSION_CONTROL", `Public Access ${enabled ? 'ACTIVATED' : 'DEACTIVATED'}`);
            toast({ title: 'Status Updated', description: `Application session is now ${enabled ? 'Active' : 'Offline'}.` });
        }).catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update'
            }));
        });
    }, [firestore, logAction, toast]);

    const setCurrentSeason = useCallback(async (seasonId: string) => {
        if (!firestore) return;
        const seasonName = seasons.find(s => s.id === seasonId)?.name || seasonId;
        const configRef = doc(firestore, 'config', 'app');
        await updateDoc(configRef, { currentSeasonId: seasonId }).then(() => {
            logAction("SWITCH_SEASON", `Active scoping shifted to ${seasonName}`);
        }).catch(() => {
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
        await updateDoc(configRef, data).then(() => {
            logAction("BROADCAST_HUB", `Update: "${announcement.message}" (${announcement.isActive ? 'ACTIVE' : 'INACTIVE'})`);
            toast({ title: 'Broadcast Updated', description: 'The public announcement is now live.' });
        }).catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update',
                requestResourceData: data
            }));
        });
    }, [firestore, toast, logAction]);

    const updateManagementImages = useCallback(async (images: string[]) => {
        if (!firestore) return;
        const configRef = doc(firestore, 'config', 'app');
        await updateDoc(configRef, { managementImages: images }).then(() => {
            logAction("UPDATE_MANAGEMENT_IMAGES", `Updated DFPL Management Slideshow (${images.length} images)`);
            toast({ title: 'Slideshow Updated', description: 'Management slideshow images have been saved.' });
        }).catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update',
                requestResourceData: { managementImages: images }
            }));
        });
    }, [firestore, toast, logAction]);

    const createNextSeason = useCallback(async () => {
        if (!firestore || seasons.length === 0) return;
        const lastSeason = [...seasons].sort((a, b) => a.year - b.year).at(-1)!;
        const lastSeasonNum = Number.parseInt(lastSeason.name.split(' ')[1]) || seasons.length;
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
        await updateDoc(configRef, {
            seasons: arrayUnion(newSeason),
            currentSeasonId: newSeason.id
        }).then(() => {
            logAction("CREATE_SEASON", `Deployed timeline for ${newSeason.name}`);
            toast({ title: 'Season Created', description: `${newSeason.name} has been created.` });
        }).catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update'
            }));
        });
    }, [firestore, seasons, toast, logAction]);

    const deleteCurrentSeason = useCallback(async () => {
        if (!firestore || !activeSeason || seasons.length <= 1) return;
        const remainingSeasons = seasons.filter(s => s.id !== activeSeason.id);
        const newCurrentSeason = [...remainingSeasons].sort((a, b) => b.year - a.year)[0];
        const configRef = doc(firestore, 'config', 'app');
        await updateDoc(configRef, { seasons: remainingSeasons, currentSeasonId: newCurrentSeason.id }).then(() => {
            logAction("DELETE_SEASON", `Permanently decommissioned ${activeSeason.name}`);
            toast({ title: 'Season Deleted', description: `${activeSeason.name} has been removed.` });
        }).catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update'
            }));
        });
    }, [firestore, seasons, activeSeason, toast, logAction]);

    const updateMatchConfig = useCallback(async (newConfig: MatchConfig) => {
        if (!firestore || !activeSeason) return;
        const configRef = doc(firestore, 'config', 'app');
        const old = activeSeason.matchConfig;
        const logs: string[] = [];

        if (old.isGroupModeActive !== newConfig.isGroupModeActive) logs.push(newConfig.isGroupModeActive ? "ENABLED Group Mode" : "DISABLED Group Mode");
        if (JSON.stringify(old.stageTimings) !== JSON.stringify(newConfig.stageTimings)) {
            logs.push("Modified Match Timings");
        }

        const details = logs.length > 0 ? `Scoping updates for ${activeSeason.name}: ${logs.join(', ')}` : `Modified stage settings for ${activeSeason.name}`;
        const updatedSeasons = seasons.map(s => s.id === activeSeason.id ? { ...s, matchConfig: newConfig } : s);

        await updateDoc(configRef, { seasons: updatedSeasons }).then(() => {
            logAction("MATCH_CONFIG", details);
        }).catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'update'
            }));
        });
    }, [firestore, seasons, activeSeason, logAction]);

    const value = useMemo(() => ({ seasons, currentSeason: activeSeason, globalAnnouncement, isLoggingEnabled, isSessionActive, managementImages, setCurrentSeason, createNextSeason, deleteCurrentSeason, updateMatchConfig, updateGlobalAnnouncement, updateManagementImages, setLoggingEnabled, setSessionActive, loading }),
        [seasons, activeSeason, globalAnnouncement, isLoggingEnabled, isSessionActive, managementImages, setCurrentSeason, createNextSeason, deleteCurrentSeason, updateMatchConfig, updateGlobalAnnouncement, updateManagementImages, setLoggingEnabled, setSessionActive, loading]);
    return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
};

export const useSeason = (): SeasonContextState => {
    const context = useContext(SeasonContext);
    if (context === undefined) throw new Error('useSeason must be used within a SeasonProvider');
    return context;
};
