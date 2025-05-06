'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; 
import { Users, Crown } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const teams = [
  { id: 't1', name: 'Alpha Eagles', owner: 'Mr. Alpha', logo: '/images/teams/alpha-eagles.jpg', players: ['Player A1', 'Player A2', 'Player A3'] },
  { id: 't2', name: 'Bravo Bears', owner: 'Ms. Bravo', logo: '/images/teams/bravo-bears.jpg', players: ['Player B1', 'Player B2'] },
  { id: 't3', name: 'Charlie Cheetahs', owner: 'Dr. Charlie', logo: '/images/teams/charlie-cheetahs.jpg', players: ['Player C1', 'Player C2', 'Player C3'] },
  { id: 't4', name: 'Delta Dragons', owner: 'Prof. Delta', logo: '/images/teams/delta-dragons.jpg', players: ['Player D1', 'Player D2'] },
  { id: 't5', name: 'Echo Foxes', owner: 'Capt. Echo', logo: '/images/teams/echo-foxes.jpg', players: ['Player E1', 'Player E2', 'Player E3'] },
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
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants} 
      >
        {teams.map((team) => (
          <motion.div key={team.id} variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <Avatar className="h-12 w-12">
                    <Image
                      src={team.logo} 
                      alt={`${team.name} Logo`}
                      width={48}
                      height={48}
                      className="rounded-full object-cover" 
                      data-ai-hint="team logo sport crest"
                      priority={true}
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
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {team.players.length} Players
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}