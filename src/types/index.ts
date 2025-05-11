// src/types/index.ts

// Basic Player information, can be extended
export interface Player {
  id: string;
  name: string;
  avatarUrl?: string; // Optional avatar URL
  // Add other common player properties if needed, e.g., jersey number
}

// Detailed Player Statistics, extending basic Player info
export interface PlayerStats extends Player {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
  // Potentially other stats like minutes played, pass accuracy, etc.
}

// Team Statistics
export interface TeamStats {
  totalGoals: number;
  totalAssists: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number; // Added for completeness
  cleanSheets?: number; // Optional
  totalYellowCards: number;
  totalRedCards: number;
  // Other team-level stats like possession average, shots on target, etc.
}

// Full Team Information, including roster and stats
export interface Team {
  id: string;
  name: string;
  owner: string;
  logoUrl: string; // URL for the team logo
  players: Player[]; // Roster of players (basic info)
  stats: TeamStats; // Aggregated team statistics
  // Optional: team formation, home ground, etc.
}

// Match Information
export interface Match {
  id: string;
  date: string | Date; // Could be ISO string or Date object
  time: string;
  homeTeam: Pick<Team, 'id' | 'name' | 'logoUrl'>; // Reference to home team
  awayTeam: Pick<Team, 'id' | 'name' | 'logoUrl'>; // Reference to away team
  homeScore?: number;
  awayScore?: number;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'POSTPONED';
  venue?: string;
  // Optional: match events (goals, cards, substitutions), referee, etc.
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
  form?: ('W' | 'D' | 'L')[]; // Last 5 matches form, e.g., ['W', 'W', 'L', 'D', 'W']
}
