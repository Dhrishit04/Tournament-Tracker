'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldCheck, Crown, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTeams } from '@/hooks/use-api';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};


// --- Component ---
const TeamsPage: React.FC = () => {
  const { teams, isLoading, isError } = useTeams();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-muted-foreground">Loading teams...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-red-500">Error: Failed to load teams.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="text-center mb-12" variants={itemVariants}>
        <ShieldCheck className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Meet the Teams</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the clubs competing for glory in Season 3 of the Dongre Football Premier League.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
      >
        {teams?.map((team) => (
          <motion.div key={team.id} variants={itemVariants}>
            <Link href={`/teams/${team.id}`} passHref>
              <Card className="h-full flex flex-col rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out group">
                <CardHeader className="flex flex-row items-center gap-4 p-4 bg-card/50">
                  <Avatar className="h-16 w-16 border-2 border-primary/50">
                    <AvatarImage src={team.logoUrl} alt={`${team.name} Logo`} className="object-cover" />
                    <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm text-amber-500 font-semibold">
                      <Crown className="w-4 h-4" />
                      {team.owner}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Team Roster
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                      {team.players && team.players.slice(0, 3).map((player) => (
                        <li key={player.id}>{player.name}</li>
                      ))}
                      {team.players && team.players.length > 3 && <li className="font-semibold">and {team.players.length - 3} more...</li>}
                    </ul>
                  </div>
                  <div className="mt-4 text-right">
                      <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
                        View Roster <ArrowRight className="w-4 h-4" />
                      </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default TeamsPage;
