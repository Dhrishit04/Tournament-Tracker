'use client';

import { createContext, ReactNode, useCallback, useMemo } from 'react';
import type { AboutPosition, TeamMember } from '@/types';
import { useCollection, useFirestore } from '@/firebase';
import { doc, setDoc, deleteDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useSeason } from '@/contexts/season-context';

export interface AboutContextState {
  positions: AboutPosition[];
  members: TeamMember[];
  loading: boolean;
  addPosition: (position: AboutPosition) => Promise<void>;
  updatePosition: (position: AboutPosition) => Promise<void>;
  deletePosition: (positionId: string) => Promise<void>;
  addMember: (member: TeamMember) => Promise<void>;
  updateMember: (member: TeamMember) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
  seedDefaultPositions: () => Promise<void>;
}

export const AboutContext = createContext<AboutContextState | undefined>(undefined);

const DEFAULT_POSITIONS: Omit<AboutPosition, 'id'>[] = [
  { title: 'Developer and System Admin', order: 1 },
  { title: 'Operations Head', order: 2 },
  { title: 'Media & Outreach Head', order: 3 },
  { title: 'On Ground Operations & Logistics', order: 4 },
];

export const AboutProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useAuth();
  const { isLoggingEnabled } = useSeason();

  const { data: positionsData, loading: positionsLoading } = useCollection<AboutPosition>('about-positions');
  const { data: membersData, loading: membersLoading } = useCollection<TeamMember>('about-members');

  const loading = positionsLoading || membersLoading;

  const positions = useMemo(() =>
    [...positionsData].sort((a, b) => a.order - b.order),
    [positionsData]
  );

  const members = useMemo(() =>
    [...membersData].sort((a, b) => a.order - b.order),
    [membersData]
  );

  // ---- Logging helper (same pattern as data-context) ----
  const logAction = useCallback(async (action: string, details: string) => {
    if (!firestore || !isLoggingEnabled || !user) return;
    const adminIdentity = user.role === 'SYSTEM_ADMIN' ? 'SYS_ADMIN' : user.email.split('@')[0];
    const logRef = collection(firestore, 'logs');
    addDoc(logRef, {
      timestamp: Date.now(),
      adminEmail: adminIdentity,
      action,
      details,
    }).catch(() => {});
  }, [firestore, isLoggingEnabled, user]);

  // ---- Position CRUD ----
  const seedDefaultPositions = useCallback(async () => {
    if (!firestore) return;
    for (const pos of DEFAULT_POSITIONS) {
      const id = `pos-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      await setDoc(doc(firestore, 'about-positions', id), pos);
    }
    logAction('ABOUT_SEED', 'Seeded default About Us positions');
  }, [firestore, logAction]);

  const addPosition = useCallback(async (position: AboutPosition) => {
    if (!firestore) return;
    const { id, ...data } = position;
    await setDoc(doc(firestore, 'about-positions', id), data);
    logAction('ABOUT_ADD_POSITION', `Created position: "${position.title}"`);
  }, [firestore, logAction]);

  const updatePosition = useCallback(async (position: AboutPosition) => {
    if (!firestore) return;
    const { id, ...data } = position;
    await setDoc(doc(firestore, 'about-positions', id), data);
    logAction('ABOUT_UPDATE_POSITION', `Updated position: "${position.title}"`);
  }, [firestore, logAction]);

  const deletePosition = useCallback(async (positionId: string) => {
    if (!firestore) return;
    // Find position title for logging
    const pos = positionsData.find((p: AboutPosition) => p.id === positionId);
    const posTitle = pos?.title || positionId;
    // Also delete all members with this positionId
    const memberSnaps = await getDocs(collection(firestore, 'about-members'));
    let deletedCount = 0;
    for (const memberDoc of memberSnaps.docs) {
      const data = memberDoc.data() as TeamMember;
      if (data.positionId === positionId) {
        await deleteDoc(doc(firestore, 'about-members', memberDoc.id));
        deletedCount++;
      }
    }
    await deleteDoc(doc(firestore, 'about-positions', positionId));
    logAction('ABOUT_DELETE_POSITION', `Deleted position: "${posTitle}" (${deletedCount} member${deletedCount !== 1 ? 's' : ''} also removed)`);
  }, [firestore, logAction, positionsData]);

  // ---- Member CRUD ----
  const addMember = useCallback(async (member: TeamMember) => {
    if (!firestore) return;
    const { id, ...data } = member;
    await setDoc(doc(firestore, 'about-members', id), data);
    const pos = positionsData.find((p: AboutPosition) => p.id === member.positionId);
    logAction('ABOUT_ADD_MEMBER', `Added member: "${member.name}" to ${pos?.title || 'Unknown'}`);
  }, [firestore, logAction, positionsData]);

  const updateMember = useCallback(async (member: TeamMember) => {
    if (!firestore) return;
    const { id, ...data } = member;
    await setDoc(doc(firestore, 'about-members', id), data);
    const pos = positionsData.find((p: AboutPosition) => p.id === member.positionId);
    logAction('ABOUT_UPDATE_MEMBER', `Updated member: "${member.name}" in ${pos?.title || 'Unknown'}`);
  }, [firestore, logAction, positionsData]);

  const deleteMember = useCallback(async (memberId: string) => {
    if (!firestore) return;
    const member = membersData.find((m: TeamMember) => m.id === memberId);
    const memberName = member?.name || memberId;
    const pos = member ? positionsData.find((p: AboutPosition) => p.id === member.positionId) : null;
    await deleteDoc(doc(firestore, 'about-members', memberId));
    logAction('ABOUT_DELETE_MEMBER', `Removed member: "${memberName}" from ${pos?.title || 'Unknown'}`);
  }, [firestore, logAction, membersData, positionsData]);

  const value: AboutContextState = {
    positions, members, loading,
    addPosition, updatePosition, deletePosition,
    addMember, updateMember, deleteMember,
    seedDefaultPositions,
  };

  return <AboutContext.Provider value={value}>{children}</AboutContext.Provider>;
};
