'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Crown, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FC } from 'react';
import { Button } from '@/components/ui/button';

interface Player {
  id: string;
  name: string;
  // Add other relevant player properties if needed for team page context
}

interface Team {
  id: string;
  name: string;
  owner: string;
  logo: string;
  players: Player[]; // Changed from string[] to Player[] for more structured data
  totalGoals?: number;
  totalAssists?: number;
  matchesPlayed?: number;
  matchesWon?: number;
  matchesLost?: number;
  yellowCards?: number;
  redCards?: number;
}

// Updated team data with player objects and basic stats for demonstration
// In a real app, this would come from a database
const teams: Team[] = [
  { 
    id: 't1', 
    name: 'Dongre Super Kicks', 
    owner: 'Amol Panchangane', 
    logo: '/images/teams/dsk.jpg', // Corrected to .jpg as per previous fixes
    players: [
      { id: '13', name: 'Amey Kawle' }, 
      { id: '6', name: 'Arjun Desai' }, 
      { id: '19', name: 'Satej Dhaiphule' }, 
      { id: '16', name: 'Shubham Parulkar' }, 
      { id: '4', name: 'Vikram' }
    ],
    totalGoals: 10,
    matchesPlayed: 5,
    matchesWon: 3,
    matchesLost: 1,
  },
  { 
    id: 't2', 
    name: 'Red Devils', 
    owner: 'Jayesh | Gaurav', 
    logo: '/images/teams/rd.jpg', // Corrected to .jpg
    players: [
      { id: '22', name: 'Harshvardhan Jadwani' }, 
      { id: '14', name: 'Krish Mistry' }, 
      { id: '9', name: 'Nirvaan Sood' }, 
      { id: '1', name: 'Shlok Desai' }, 
      { id: '20', name: 'Shreyas K' }
    ],
    totalGoals: 12,
    matchesPlayed: 5,
    matchesWon: 4,
    matchesLost: 0,
  },
  { 
    id: 't3', 
    name: 'Shadow Hawks', 
    owner: 'Abhijeet | Akhil', 
    logo: '/images/teams/sh.jpg', // Corrected to .jpg
    players: [
      { id: '5', name: 'Aaron Dsouza' }, 
      { id: '15', name: 'Arnav Chaudhary' }, 
      { id: '8', name: 'Deep Patel' }, 
      { id: '25', name: 'Harsh Daware' }, 
      { id: '11', name: 'Tanish Gawade' }
    ],
    totalGoals: 8,
    matchesPlayed: 5,
    matchesWon: 2,
    matchesLost: 2,
  },
  { 
    id: 't4', 
    name: 'White Knights FC', 
    owner: 'Pushpinder | Prateek', 
    logo: '/images/teams/wk.jpg', // Corrected to .jpg
    players: [
      { id: '21', name: 'Anish' }, 
      { id: '10', name: 'Atharva Sawant' }, 
      { id: '3', name: 'Dhrishit Seal' }, 
      { id: '17', name: 'Paras Patil' }, 
      { id: '12', name: 'Sarthak Sharma' }
    ],
    totalGoals: 9,
    matchesPlayed: 5,
    matchesWon: 2,
    matchesLost: 1,
  },
  { 
    id: 't5', 
    name: 'Real Pawcelona', 
    owner: 'Atharva | Jordan | Ansh', 
    logo: '/images/teams/rp.jpg', // Corrected to .jpg
    players: [
      { id: '2', name: 'Aarya Kawle' }, 
      { id: '24', name: 'Ayaan Ansaari' }, 
      { id: '23', name: 'Ansh Bhardwaj' }, 
      { id: '7', name: 'Hridant Sood' }, 
      { id: '18', name: 'Parth Jadwani' }
    ],
    totalGoals: 15,
    matchesPlayed: 5,
    matchesWon: 5,
    matchesLost: 0,
  },
];


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const TeamCardContent: FC<{ team: Team }> = ({ team }) => (
  <div className="w-full text-left p-4 relative"> {/* Added padding and relative positioning */}
    <Link href={`/teams/${team.id}`} passHref legacyBehavior>
      <Avatar className="h-12 w-12">
        <Image
          src={team.logo}
          alt={`${team.name} Logo`}
          width={48}
          height={48}
          className="rounded-full object-cover"
          data-ai-hint="team logo sport crest"
          priority={false}
           onError={(e) => {
            e.currentTarget.onerror = null; 
            e.currentTarget.src = `https://picsum.photos/seed/${team.id}/48/48`;
          }}
        />
        <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
    </Link>
    <div className="flex items-center gap-4">
       <Avatar Link href={`/teams/${team.id}`} passHref legacyBehavior>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
          aria-label={`View details for ${team.name}`}
        > <ExternalLink className="w-5 h-5" /></Button>
      </Avatar>
        <CardTitle className="text-lg font-semibold">{team.name}</CardTitle> {/* Adjusted font size */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"> {/* Adjusted font size */}
          <Crown className="w-3 h-3" /> {/* Adjusted icon size */}
          <span>{team.owner}</span>
        </div>
      </div>
    </div>
);

export default function TeamsPage() {
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-3xl font-bold flex items-center gap-2"
        variants={itemVariants}
      >
        <Users className="w-8 h-8 text-primary" />
        Teams
      </motion.h1>
      <Accordion type="single" collapsible className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <motion.div key={team.id} variants={itemVariants}>
            <Card className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              <AccordionItem value={team.id} className="border-b-0 w-full">
                 <div className="w-full text-left p-4 relative"> {/* Added padding and relative positioning */}
                    <Link href={`/teams/${team.id}`} passHref legacyBehavior>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
                        aria-label={`View details for ${team.name}`}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </Link>
                     <AccordionTrigger className="p-0 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-lg w-full">
                      <div className="flex items-center gap-4">
                           <Avatar className="h-12 w-12">
                            <Image src={team.logo} alt={`${team.name} Logo`} width={48} height={48} className="rounded-full object-cover" data-ai-hint="team logo sport crest" priority={false} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://picsum.photos/seed/${team.id}/48/48`; }} />
                            <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        <div className="flex flex-col">
                          <CardTitle className="text-lg font-semibold">{team.name}</CardTitle>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><Crown className="w-3 h-3" /><span>{team.owner}</span></div>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </div>
                <AccordionContent>
                  <div className="p-4 border-t bg-card">
                    <h4 className="font-semibold mb-2 text-card-foreground text-sm">Team Roster ({team.players.length} Players):</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {team.players.map((player) => (
                        <li key={player.id}>{player.name}</li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
          </motion.div>
        ))}
      </Accordion>
    </motion.div>
  );
}

// Export teams data for use in the dynamic team page
export const getTeamsData = () => teams;
export type { Team as TeamType, Player as PlayerType };
