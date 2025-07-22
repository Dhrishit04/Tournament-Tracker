'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from 'framer-motion';

const standingsData = [
    { rank: 1, team: 'Dongre Super Kicks', played: 6, won: 4, drawn: 1, lost: 0, gd: 6, points: 13 },
    { rank: 2, team: 'Shadow Hawks', played: 6, won: 3, drawn: 0, lost: 2, gd: 9, points: 1 },
    { rank: 3, team: 'White Knights FC', played: 5, won: 4, drawn: 1, lost: 0, gd: 13, points: 4 },
    { rank: 4, team: 'Red Devils', played: 5, won: 4, drawn: 1, lost: 0, gd: 13, points: 5 },
    { rank: 5, team: 'Real Pawcelona', played: 4, won: 4, drawn: 1, lost: 0, gd: 13, points: 3 },
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

const StandingsPage: React.FC = () => {
  return (
    <motion.div
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-center">Table Standings</CardTitle>
                <CardDescription className="text-center text-md">
                    Current league standings for Season 3.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center font-bold">Rank</TableHead>
                                <TableHead className="font-bold">Team</TableHead>
                                <TableHead className="text-center font-bold">Played</TableHead>
                                <TableHead className="text-center font-bold">Won</TableHead>
                                <TableHead className="text-center font-bold">Drawn</TableHead>
                                <TableHead className="text-center font-bold">Lost</TableHead>
                                <TableHead className="text-center font-bold">GD</TableHead>
                                <TableHead className="text-center font-bold text-primary">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {standingsData.map((team) => (
                                <motion.tr key={team.rank} variants={itemVariants} className="hover:bg-muted/50">
                                    <TableCell className="text-center font-medium">{team.rank}</TableCell>
                                    <TableCell className="font-medium">{team.team}</TableCell>
                                    <TableCell className="text-center">{team.played}</TableCell>
                                    <TableCell className="text-center">{team.won}</TableCell>
                                    <TableCell className="text-center">{team.drawn}</TableCell>
                                    <TableCell className="text-center">{team.lost}</TableCell>
                                    <TableCell className="text-center">{team.gd > 0 ? `+${team.gd}` : team.gd}</TableCell>
                                    <TableCell className="text-center font-extrabold text-primary">{team.points}</TableCell>
                                </motion.tr>
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

export default StandingsPage;
