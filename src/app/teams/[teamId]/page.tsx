'use client';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Shield, Users, Crown, TrendingUp, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Goal, BarChart2, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTeamsData, TeamType } from '../page'; // Assuming teams data is exportable from parent
import { players as allPlayersData, PlayerType as DetailedPlayerType } from '@/app/players/page'; // Assuming players data is exportable


interface PlayerStats extends DetailedPlayerType {
  yellowCards?: number;
  redCards?: number;
}

interface TeamPageProps {
  params: {
    teamId: string;
  };
}

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: 0.1 } },
};


export default function TeamDetailPage({ params }: TeamPageProps) {
  // Use React.use to unwrap the params promise
  const teamId = React.use(params).teamId;

  const teams = getTeamsData();
  const team = teams.find((t) => t.id === teamId);

  if (!team) {
    notFound();
  }

  const teamPlayers = allPlayersData.filter(p => p.team === team.name)
    .map(p => ({
      ...p,
      // Add mock card data if not present
      yellowCards: p.yellowCards ?? Math.floor(Math.random() * 5),
      redCards: p.redCards ?? Math.floor(Math.random() * 1)
    }));

  if (!team) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-muted-foreground">Loading team details...</p>
      </div>
    );
  }
  
  // Aggregate team stats from players if not directly available on team object
  const aggregatedTeamStats = {
    totalGoals: team.totalGoals ?? teamPlayers.reduce((sum, p) => sum + (p.goals || 0), 0),
    totalAssists: team.totalAssists ?? teamPlayers.reduce((sum, p) => sum + (p.assists || 0), 0),
    matchesPlayed: team.matchesPlayed ?? teamPlayers.reduce((max, p) => Math.max(max, p.matchesPlayed || 0), 0), // Simplistic, assumes all players played team matches
    matchesWon: team.matchesWon ?? teamPlayers.reduce((sum, p) => sum + (p.matchesWon || 0), 0) / (teamPlayers.length || 1), // Average, needs better logic
    matchesLost: team.matchesLost ?? teamPlayers.reduce((sum, p) => sum + (p.matchesLost || 0), 0) / (teamPlayers.length || 1), // Average, needs better logic
    yellowCards: team.yellowCards ?? teamPlayers.reduce((sum, p) => sum + (p.yellowCards || 0), 0),
    redCards: team.redCards ?? teamPlayers.reduce((sum, p) => sum + (p.redCards || 0), 0),
  };


  return (
    <motion.div 
      className="container mx-auto px-4 py-8 space-y-8"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <motion.div variants={itemVariants}>
        <Button variant="outline" asChild className="mb-6">
          <Link href="/teams">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
          </Link>
        </Button>
      </motion.div>

      <motion.header 
        className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-lg shadow-lg"
        variants={itemVariants}
      >
        <Avatar className="h-24 w-24 border-4 border-primary">
          <Image
            src={team.logo}
            alt={`${team.name} Logo`}
            width={96}
            height={96}
            className="rounded-full object-cover"
            data-ai-hint="team logo sport crest"
            priority
             onError={(e) => {
                e.currentTarget.onerror = null; 
                e.currentTarget.src = `https://picsum.photos/seed/${team.id}/96/96`;
              }}
          />
          <AvatarFallback className="text-3xl">{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold text-primary">{team.name}</h1>
          <div className="flex items-center gap-2 text-lg text-muted-foreground mt-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span>{team.owner}</span>
          </div>
        </div>
      </motion.header>

      <motion.section variants={itemVariants}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart2 className="w-7 h-7 text-primary" />
              Team Statistics
            </CardTitle>
            <CardDescription>Overall performance of {team.name} in the league.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
              <Goal className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{aggregatedTeamStats.totalGoals}</p>
              <p className="text-sm text-muted-foreground">Total Goals</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{aggregatedTeamStats.totalAssists}</p>
              <p className="text-sm text-muted-foreground">Total Assists</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
              <p className="text-2xl font-bold">{aggregatedTeamStats.matchesPlayed}</p>
              <p className="text-sm text-muted-foreground">Matches Played</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-teal-500" />
              <p className="text-2xl font-bold">{Math.round(aggregatedTeamStats.matchesWon)}</p>
              <p className="text-sm text-muted-foreground">Matches Won</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
              <p className="text-2xl font-bold">{Math.round(aggregatedTeamStats.matchesLost)}</p>
              <p className="text-sm text-muted-foreground">Matches Lost</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-yellow-500" /> {/* Using ShieldCheck for yellow cards */}
              <p className="text-2xl font-bold">{aggregatedTeamStats.yellowCards}</p>
              <p className="text-sm text-muted-foreground">Yellow Cards</p>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-red-600" /> {/* Using ShieldAlert for red cards */}
              <p className="text-2xl font-bold">{aggregatedTeamStats.redCards}</p>
              <p className="text-sm text-muted-foreground">Red Cards</p>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section variants={itemVariants}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-7 h-7 text-primary" />
              Player Statistics
            </CardTitle>
            <CardDescription>Individual performance of players in {team.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Goals</TableHead>
                  <TableHead className="text-center">Assists</TableHead>
                  <TableHead className="text-center">Yellow Cards</TableHead>
                  <TableHead className="text-center">Red Cards</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                           <Image
                              src={`/images/players/player-${player.id}.jpg`}
                              alt={`${player.name} avatar`}
                              width={36}
                              height={36}
                              className="rounded-full object-cover"
                              data-ai-hint="player portrait soccer"
                              onError={(e) => {
                                  e.currentTarget.onerror = null; 
                                  e.currentTarget.src = `https://picsum.photos/seed/${player.id}/36/36`;
                              }}
                            />
                          <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{player.goals ?? 0}</TableCell>
                    <TableCell className="text-center">{player.assists ?? 0}</TableCell>
                    <TableCell className="text-center">{player.yellowCards ?? 0}</TableCell>
                    <TableCell className="text-center">{player.redCards ?? 0}</TableCell>
                  </TableRow>
                ))}
                {teamPlayers.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No player data available for this team.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  );
}

// Helper to get player data, can be expanded
export const getPlayersData = () => allPlayersData;
export type { PlayerStats as TeamPlayerStatsType };
