// src/types/index.ts

// A comprehensive Player interface that matches the Firebase data model
export interface Player {
  id: string;
  name: string;
  teamId: string; // Changed from team to teamId
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
  yellowCards?: number;
  redCards?: number;
  avatarUrl?: string; // Optional avatar URL
}

// Team Statistics
export interface TeamStats {
  totalGoals: number;
  totalAssists: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  cleanSheets?: number;
  totalYellowCards: number;
  totalRedCards: number;
}

// Full Team Information, including roster and stats
export interface Team {
  id: string;
  name: string;
  owner: string;
  logoUrl: string; // URL for the team logo, renamed from 'logo' for consistency
  players: Player[]; // Roster of players uses the new comprehensive Player type
  stats: TeamStats;
}

// Match Information
export interface Match {
  id:string;
  date: string | Date;
  time: string;
  homeTeam: Pick<Team, 'id' | 'name' | 'logoUrl'>;
  awayTeam: Pick<Team, 'id' | 'name' | 'logoUrl'>;
  homeScore?: number;
  awayScore?: number;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'POSTPONED';
  venue?: string;
}

// League Standings Entry
export interface Standing {
  rank: number;
  team: Pick<Team, 'id' | 'name' | 'logoUrl'>;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: ('W' | 'D' | 'L')[];
}
