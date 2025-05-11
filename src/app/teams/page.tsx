'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Crown } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FC } from 'react';

interface Team {
  id: string;
  name: string;
  owner: string;
  logo: string;
  players: string[];
}

const teams: Team[] = [
  { id: 't1', name: 'Dongre Super Kicks', owner: 'Amol Panchangane', logo: '/images/teams/dsk.jpg', players: ['Player 1A', 'Player 1B', 'Player 1C', 'Player 1D', 'Player 1E'] },
  { id: 't2', name: 'Red Devils', owner: 'Jayesh | Gaurav', logo: '/images/teams/rd.jpg', players: ['Player 2A', 'Player 2B', 'Player 2C', 'Player 2D', 'Player 2E'] },
  { id: 't3', name: 'Shadow Hawks', owner: 'Abhijeet | Akhil', logo: '/images/teams/sh.jpg', players: ['Player 3A', 'Player 3B', 'Player 3C', 'Player 3D', 'Player 3E'] },
  { id: 't4', name: 'White Knights FC', owner: 'Pushpinder | Prateek', logo: '/images/teams/wk.jpg', players: ['Player 4A', 'Player 4B', 'Player 4C', 'Player 4D', 'Player 4E'] },
  { id: 't5', name: 'Real Pawcelona', owner: 'Atharva | Jordan | Ansh', logo: '/images/teams/rp.jpg', players: ['Player 5A', 'Player 5B', 'Player 5C', 'Player 5D', 'Player 5E'] },
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
  <div className="w-full text-left">
    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
      <Avatar className="h-12 w-12">
        <Image
          src={team.logo}
          alt={`${team.name} Logo`}
          width={48}
          height={48}
          className="rounded-full object-cover"
          data-ai-hint="team logo sport crest"
          priority={false} // Set to false as many images are loaded
           onError={(e) => {
            // Fallback to picsum if local image fails
            e.currentTarget.onerror = null; 
            e.currentTarget.src = `https://picsum.photos/seed/${team.id}/48/48`;
          }}
        />
        <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <CardTitle>{team.name}</CardTitle>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <Crown className="w-4 h-4" />
          <span>{team.owner}</span>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-2">
      <p className="text-sm text-muted-foreground">
        {team.players.length} Players
      </p>
    </CardContent>
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
      <Accordion type="single" collapsible className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
        {teams.map((team) => (
          <motion.div key={team.id} variants={itemVariants}>
            <Card className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <AccordionItem value={team.id} className="border-b-0">
                <AccordionTrigger className="p-0 hover:no-underline w-full data-[state=open]:bg-muted/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-lg">
                  <TeamCardContent team={team} />
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 border-t bg-card">
                    <h4 className="font-semibold mb-2 text-card-foreground text-sm">Team Roster:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {team.players.map((player, index) => (
                        <li key={index}>{player}</li>
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
