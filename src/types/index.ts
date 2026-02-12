
export type MatchStage = 'GROUP_STAGE' | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'FINALS' | 'OTHERS';

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'Goal' | 'Assist' | 'Yellow Card' | 'Red Card' | 'Own Goal';
  playerId: string;
  teamId: string;
  playerName: string;
  linkedGoalId?: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  category: string;
  basePrice: string;
  preferredPosition: string[];
  preferredFoot: string;
  age?: number;
  remarks: string[];
  goals?: number;
  assists?: number;
  matchesPlayed?: number;
  matchesWon?: number;
  matchesLost?: number;
  yellowCards: number;
  redCards: number;
  avatarUrl?: string;
}

export interface TeamStats {
  totalGoals: number;
  totalAssists: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  goalsAgainst: number;
  cleanSheets?: number;
  totalYellowCards: number;
  totalRedCards: number;
}

export interface Team {
  id: string;
  name: string;
  owner: string;
  logoUrl: string;
  group?: string;
  players?: Player[];
  stats: TeamStats;
}

export interface Match {
  id:string;
  date: string | Date;
  time: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'POSTPONED';
  isExtraTime?: boolean;
  venue?: string;
  events?: MatchEvent[];
  stage?: MatchStage;
  description?: string;
}

export interface Standing {
  rank: number;
  team: Pick<Team, 'id' | 'name' | 'logoUrl' | 'group'>;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface StageTiming {
  duration?: number;
  extraTime?: number;
}

export interface MatchConfig {
  showGroupStage: boolean;
  showQuarterFinals: boolean;
  showOthers: boolean;
  isGroupModeActive: boolean;
  showVenue: boolean;
  stageTimings?: Record<string, StageTiming>;
}

export interface GlobalAnnouncement {
  message: string;
  isActive: boolean;
  updatedAt?: number;
}

export interface Season {
  id: string;
  name: string;
  year: number;
  matchConfig: MatchConfig;
}

export interface SeasonConfig {
  currentSeasonId: string;
  isLoggingEnabled?: boolean;
  seasons: Season[];
  globalAnnouncement?: GlobalAnnouncement;
}

export interface AdminProfile {
  id: string;
  email: string;
  password?: string;
  displayName?: string;
  createdAt: number;
  canAccessSettings?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  adminEmail: string;
  action: string;
  details: string;
}
