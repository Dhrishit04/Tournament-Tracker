'use client';

import React from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTeamById, Team, Player } from '@/lib/team-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Shield, Users, Crown, TrendingUp, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Goal, BarChart2, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.2, duration: 0.5 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

// --- Helper Components ---
const StatCard = ({ icon, label, value, color }: { icon: React.ElementType, label: string, value: string | number, color?: string }) => {
    const Icon = icon;
    return (
        <motion.div variants={itemVariants}>
            <Card className="flex flex-col items-center justify-center p-4 h-full text-center shadow-md">
                <Icon className={`w-8 h-8 mb-2 ${color || 'text-primary'}`} />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </Card>
        </motion.div>
    );
};


// --- Main Component ---
const TeamDetailPage = () => {
    const params = useParams<{ teamId: string }>();
    const team: Team | undefined = getTeamById(params.teamId);

    if (!team) {
        return notFound();
    }

    // --- Aggregate Stats ---
    const totalGoals = team.players.reduce((acc, p) => acc + (p.goals || 0), 0);
    const totalAssists = team.players.reduce((acc, p) => acc + (p.assists || 0), 0);
    const matchesPlayed = team.players[0]?.matchesPlayed ?? 0;
    const matchesWon = team.players[0]?.matchesWon ?? 0;
    const matchesLost = team.players[0]?.matchesLost ?? 0;
    const yellowCards = team.players.reduce((acc, p) => acc + (p.yellowCards || 0), 0);
    const redCards = team.players.reduce((acc, p) => acc + (p.redCards || 0), 0);


    return (
        <motion.div
            className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* --- Back Button --- */}
            <motion.div variants={itemVariants} className="mb-6">
                <Button asChild variant="outline">
                    <Link href="/teams" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Teams
                    </Link>
                </Button>
            </motion.div>

            {/* --- Team Header --- */}
            <motion.div variants={itemVariants} className="mb-8">
                <Card className="flex flex-col sm:flex-row items-center gap-6 p-6 shadow-lg">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={team.logo} alt={`${team.name} Logo`} className="object-cover" />
                        <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-extrabold">{team.name}</h1>
                        <p className="flex items-center justify-center sm:justify-start gap-2 text-lg text-amber-500 font-semibold mt-1">
                            <Crown className="w-5 h-5" />
                            {team.owner}
                        </p>
                    </div>
                </Card>
            </motion.div>

            {/* --- Team Statistics --- */}
            <motion.div variants={itemVariants} className="mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <BarChart2 className="w-6 h-6" />
                            Team Statistics
                        </CardTitle>
                        <CardDescription>Overall performance of {team.name} in the league.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <StatCard icon={Goal} label="Total Goals" value={totalGoals} color="text-green-500"/>
                        <StatCard icon={TrendingUp} label="Total Assists" value={totalAssists} color="text-blue-500"/>
                        <StatCard icon={CalendarDays} label="Matches Played" value={matchesPlayed} />
                        <StatCard icon={CheckCircle} label="Matches Won" value={matchesWon} color="text-green-500"/>
                        <StatCard icon={XCircle} label="Matches Lost" value={matchesLost} color="text-red-500"/>
                        <StatCard icon={ShieldCheck} label="Yellow Cards" value={yellowCards} color="text-yellow-500"/>
                        <StatCard icon={ShieldAlert} label="Red Cards" value={redCards} color="text-red-700"/>
                    </CardContent>
                </Card>
            </motion.div>


            {/* --- Player Roster --- */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <Users className="w-6 h-6" />
                            Player Roster
                        </CardTitle>
                         <CardDescription>Individual performance of players in {team.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="overflow-x-auto">
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
                                    {team.players.map((player) => (
                                        <TableRow key={player.id}>
                                            <TableCell className="font-medium">{player.name}</TableCell>
                                            <TableCell className="text-center">{player.goals ?? 0}</TableCell>
                                            <TableCell className="text-center">{player.assists ?? 0}</TableCell>
                                            <TableCell className="text-center">{player.yellowCards ?? 0}</TableCell>
                                            <TableCell className="text-center">{player.redCards ?? 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default TeamDetailPage;
