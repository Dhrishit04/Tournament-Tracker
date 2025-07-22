
export interface Player {
  id: string;
  name: string;
  team: string;
  category?: string;
  basePrice?: string;
  preferredPosition?: string[];
  preferredFoot?: string;
  age?: number;
  remarks?: string[];
  goals?: number;
  assists?: number;
  matchesPlayed?: number;
  matchesWon?: number;
  matchesLost?: number;
  yellowCards?: number;
  redCards?: number;
}

export interface Team {
  id: string;
  name: string;
  owner: string;
  logo: string;
  players: Player[];
}

const players: Player[] = [
    { id: '1', category: '5★', basePrice: '10pts', name: 'Ayush Dongre', preferredPosition: ['FWD', 'MID'], preferredFoot: 'R', age: 24, remarks: ['Finishing', 'Captain'], team: 'Red Devils', goals: 12, assists: 3, matchesPlayed: 5, matchesWon: 4, matchesLost: 0, yellowCards: 0, redCards: 0 },
    { id: '2', category: '5★', basePrice: '10pts', name: 'Nilesh Dongre', preferredPosition: ['FWD', 'MID'], preferredFoot: 'R', age: 24, remarks: ['Finishing', 'Captain'], team: 'Shadow Hawks', goals: 9, assists: 1, matchesPlayed: 6, matchesWon: 3, matchesLost: 2, yellowCards: 1, redCards: 0 },
    { id: '3', name: 'Vikram', team: 'Dongre Super Kicks', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
    { id: '4', name: 'Arjun Desai', team: 'Dongre Super Kicks', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
    { id: '5', name: 'Amey Kawle', team: 'Dongre Super Kicks', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
    { id: '6', name: 'Shubham Parulkar', team: 'Dongre Super Kicks', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
    { id: '7', name: 'Satej Dhaiphule', team: 'Dongre Super Kicks', goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
    { id: '8', name: 'Player A', team: 'Red Devils' },
    { id: '9', name: 'Player B', team: 'Red Devils' },
    { id: '10', name: 'Player C', team: 'Shadow Hawks' },
    { id: '11', name: 'Player D', team: 'White Knights FC' },
    { id: '12', name: 'Player E', team: 'White Knights FC' },
    { id: '13', name: 'Player F', team: 'Dongre Super Kicks' },
    { id: '14', name: 'Player G', team: 'Real Pawcelona' },
];

const teamsData = [
  {
    id: 'rd',
    name: 'Red Devils',
    owner: 'Ayush Dongre',
    logo: '/images/teams/rd.png',
  },
  {
    id: 'sh',
    name: 'Shadow Hawks',
    owner: 'Nilesh Dongre',
    logo: '/images/teams/sh.png',
  },
  {
    id: 'wk',
    name: 'White Knights FC',
    owner: 'Manash',
    logo: '/images/teams/wk.png',
  },
  {
    id: 'dsk',
    name: 'Dongre Super Kicks',
    owner: 'Prathamesh',
    logo: '/images/teams/dsk.png',
  },
  {
    id: 'rp',
    name: 'Real Pawcelona',
    owner: 'Rohan',
    logo: '/images/teams/RP.png',
  },
];

export const teams: Team[] = teamsData.map(team => ({
  ...team,
  players: players.filter(p => p.team === team.name),
}));

export const getTeamById = (id: string): Team | undefined => {
    return teams.find(team => team.id === id);
}
