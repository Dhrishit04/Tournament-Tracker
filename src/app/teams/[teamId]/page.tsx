'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Team } from '@/types';
import { fetchTeamById } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Crown, Users, BarChart2 } from 'lucide-react';
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

// --- Main Component ---
const TeamDetailPage = () => {
    const params = useParams<{ teamId: string }>();
    const [team, setTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!params.teamId) return;

        const getTeam = async () => {
            try {
                const data = await fetchTeamById(params.teamId);
                if (data) {
                    setTeam(data);
                } else {
                    setError("Team not found.");
                }
            } catch (err) {
                setError("Failed to load team data.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        getTeam();
    }, [params.teamId]);

    if (isLoading) {
        return <div className="container text-center py-8"><p>Loading team details...</p></div>;
    }

    if (error) {
        return <div className="container text-center py-8"><p className="text-red-500">Error: {error}</p></div>;
    }

    if (!team) {
        return notFound();
    }

    const { stats, players } = team;

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
                        <AvatarImage src={team.logoUrl} alt={`${team.name} Logo`} className="object-cover" />
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
                       {/* Stats are now read directly from the team object */}
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
                                    {players && players.map((player) => (
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
