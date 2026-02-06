import type { Team, Player, Match, Standing, TeamStats, MatchStage } from '@/types';

export const mockPlayers: Player[] = [
  { id: 'p1', name: 'Alex Morgan', teamId: 't1', category: 'A', basePrice: '1.5 Cr', preferredPosition: ['Forward'], preferredFoot: 'Right', age: 32, goals: 12, assists: 5, matchesPlayed: 10, avatarUrl: 'player-avatar-1', remarks: ['Clinical finisher'], yellowCards: 1, redCards: 0 },
  { id: 'p2', name: 'Ben Carter', teamId: 't1', category: 'B', basePrice: '80 Lacs', preferredPosition: ['Midfielder'], preferredFoot: 'Left', age: 25, goals: 4, assists: 8, matchesPlayed: 10, avatarUrl: 'player-avatar-2', remarks: ['Great vision'], yellowCards: 2, redCards: 0 },
  { id: 'p3', name: 'Chris Evans', teamId: 't2', category: 'A', basePrice: '1.2 Cr', preferredPosition: ['Defender'], preferredFoot: 'Right', age: 29, goals: 1, assists: 1, matchesPlayed: 10, avatarUrl: 'player-avatar-3', remarks: ['Solid defender'], yellowCards: 3, redCards: 1 },
  { id: 'p4', name: 'David Villa', teamId: 't2', category: 'C', basePrice: '50 Lacs', preferredPosition: ['Forward'], preferredFoot: 'Right', age: 22, goals: 8, assists: 2, matchesPlayed: 9, avatarUrl: 'player-avatar-4', remarks: ['Pacy winger'], yellowCards: 0, redCards: 0 },
  { id: 'p5', name: 'Ethan Hunt', teamId: 't3', category: 'B', basePrice: '90 Lacs', preferredPosition: ['Goalkeeper'], preferredFoot: 'Right', age: 28, goals: 0, assists: 0, matchesPlayed: 10, remarks: ['Excellent shot-stopper'], yellowCards: 0, redCards: 0 },
  { id: 'p6', name: 'Frank Lampard', teamId: 't3', category: 'A', basePrice: '2 Cr', preferredPosition: ['Midfielder'], preferredFoot: 'Right', age: 35, goals: 9, assists: 10, matchesPlayed: 10, remarks: ['Legendary midfielder'], yellowCards: 4, redCards: 0 },
  { id: 'p7', name: 'Gareth Bale', teamId: 't4', category: 'A', basePrice: '1.8 Cr', preferredPosition: ['Forward', 'Winger'], preferredFoot: 'Left', age: 33, goals: 10, assists: 4, matchesPlayed: 10, remarks: ['Speed demon'], yellowCards: 1, redCards: 0 },
  { id: 'p8', name: 'Harry Kane', teamId: 't4', category: 'A', basePrice: '2.5 Cr', preferredPosition: ['Forward'], preferredFoot: 'Right', age: 29, goals: 15, assists: 3, matchesPlayed: 10, remarks: ['Prolific goalscorer'], yellowCards: 0, redCards: 0 },
];

export const mockTeamStats: Record<string, TeamStats> = {
  t1: { totalGoals: 16, totalAssists: 13, matchesPlayed: 3, matchesWon: 2, matchesLost: 1, matchesDrawn: 0, goalsAgainst: 4, totalYellowCards: 3, totalRedCards: 0 },
  t2: { totalGoals: 9, totalAssists: 3, matchesPlayed: 3, matchesWon: 1, matchesLost: 1, matchesDrawn: 1, goalsAgainst: 5, totalYellowCards: 3, totalRedCards: 1 },
  t3: { totalGoals: 9, totalAssists: 10, matchesPlayed: 3, matchesWon: 1, matchesLost: 2, matchesDrawn: 0, goalsAgainst: 8, totalYellowCards: 4, totalRedCards: 0 },
  t4: { totalGoals: 25, totalAssists: 7, matchesPlayed: 3, matchesWon: 3, matchesLost: 0, matchesDrawn: 0, goalsAgainst: 1, totalYellowCards: 1, totalRedCards: 0 },
};

export const mockTeams: Team[] = [
  { id: 't1', name: 'Warriors FC', owner: 'Rohan Sharma', logoUrl: 'team-logo-1', players: mockPlayers.filter(p => p.teamId === 't1'), stats: mockTeamStats['t1'] },
  { id: 't2', name: 'Titans', owner: 'Priya Mehta', logoUrl: 'team-logo-2', players: mockPlayers.filter(p => p.teamId === 't2'), stats: mockTeamStats['t2'] },
  { id: 't3', name: 'Phoenix FC', owner: 'Anil Kapoor', logoUrl: 'team-logo-3', players: mockPlayers.filter(p => p.teamId === 't3'), stats: mockTeamStats['t3'] },
  { id: 't4', name: 'Gladiators', owner: 'Sunita Williams', logoUrl: 'team-logo-4', players: mockPlayers.filter(p => p.teamId === 't4'), stats: mockTeamStats['t4'] },
];

const assignStage = (index: number): MatchStage => {
  if (index < 4) return 'GROUP_STAGE';
  if (index === 4) return 'SEMI_FINALS';
  if (index === 5) return 'FINALS';
  return 'GROUP_STAGE';
};

export const mockMatches: Match[] = [
  { id: 'm1', date: new Date(2026, 6, 20), time: '19:00', homeTeamId: 't1', awayTeamId: 't2', homeScore: 2, awayScore: 1, status: 'FINISHED', venue: 'Main Stadium', events: [], stage: 'GROUP_STAGE' },
  { id: 'm2', date: new Date(2026, 6, 21), time: '21:00', homeTeamId: 't3', awayTeamId: 't4', homeScore: 1, awayScore: 3, status: 'FINISHED', venue: 'Main Stadium', events: [], stage: 'GROUP_STAGE' },
  { id: 'm3', date: new Date(2026, 6, 27), time: '19:00', homeTeamId: 't1', awayTeamId: 't3', homeScore: 3, awayScore: 0, status: 'FINISHED', venue: 'City Arena', events: [], stage: 'GROUP_STAGE' },
  { id: 'm4', date: new Date(2026, 6, 28), time: '21:00', homeTeamId: 't2', awayTeamId: 't4', homeScore: 0, awayScore: 2, status: 'FINISHED', venue: 'City Arena', events: [], stage: 'GROUP_STAGE' },
  { id: 'm5', date: new Date(2026, 7, 3), time: '19:00', homeTeamId: 't4', awayTeamId: 't1', status: 'UPCOMING', venue: 'Main Stadium', events: [], stage: 'FINALS' },
  { id: 'm6', date: new Date(2026, 7, 4), time: '21:00', homeTeamId: 't3', awayTeamId: 't2', status: 'UPCOMING', venue: 'Main Stadium', events: [], stage: 'SEMI_FINALS' },
];

export const mockStandings: Standing[] = [
  { rank: 1, team: { id: 't4', name: 'Gladiators', logoUrl: 'team-logo-4' }, played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, points: 6 },
  { rank: 2, team: { id: 't1', name: 'Warriors FC', logoUrl: 'team-logo-1' }, played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, points: 6 },
  { rank: 3, team: { id: 't2', name: 'Titans', logoUrl: 'team-logo-2' }, played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 4, goalDifference: -3, points: 0 },
  { rank: 4, team: { id: 't3', name: 'Phoenix FC', logoUrl: 'team-logo-3' }, played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 6, goalDifference: -5, points: 0 },
].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
