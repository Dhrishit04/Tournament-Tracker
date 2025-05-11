'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed AvatarImage as it's not used standalone here
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserSquare, TrendingUp, Shield, Zap, Star, CalendarDays, CheckCircle, XCircle, Users, ChevronDownIcon, ChevronUpIcon, Goal } from 'lucide-react'; // Added Goal
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react'; 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export interface PlayerType {
  id: string;
  category: string;
  basePrice: string;
  name: string;
  preferredPosition: string[];
  preferredFoot: string;
  age?: number; // Made age optional as per one data point
  remarks: string[];
  team: string;
  goals?: number;
  assists?: number;
  matchesPlayed?: number;
  matchesWon?: number;
  matchesLost?: number;
  yellowCards?: number; // Added for consistency
  redCards?: number; // Added for consistency
}


export const players: PlayerType[] = [
  { id: '1', category: '5★', basePrice: '10pts', name: 'Shlok Desai', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 24, remarks: ['Captaincy', 'Physcial Strength'], team: 'Red Devils', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '2', category: '5★', basePrice: '10pts', name: 'Aarya Kawle', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 21, remarks: ['Captaincy', 'Game Sense'], team: 'Real Pawcelona', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '3', category: '5★', basePrice: '10pts', name: 'Dhrishit Seal', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: 20, remarks: ['Playmaking', 'Team player'], team: 'White Knights FC', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '4', category: '5★', basePrice: '10pts', name: 'Vikram', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: 40, remarks: ['Playmaking', 'Captaincy'], team: 'Dongre Super Kicks', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '5', category: '5★', basePrice: '10pts', name: 'Aaron Dsouza', preferredPosition: ['FW'], preferredFoot: 'R', age: 23, remarks: ['Finishing', 'Skills'], team: 'Shadow Hawks', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '6', category: '4★', basePrice: '6pts', name: 'Arjun Desai', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 17, remarks: ['All rounder'], team: 'Dongre Super Kicks', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '7', category: '4★', basePrice: '6pts', name: 'Hridant Sood', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 17, remarks: ['Dribbling', 'Passing'], team: 'Real Pawcelona', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '8', category: '4★', basePrice: '6pts', name: 'Deep Patel', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 22, remarks: ['Positioning', 'Long passing'], team: 'Shadow Hawks', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '9', category: '4★', basePrice: '6pts', name: 'Nirvaan Sood', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 22, remarks: ['Captaincy', 'Team player'], team: 'Red Devils', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '10', category: '4★', basePrice: '6pts', name: 'Atharva Sawant', preferredPosition: ['FW', 'MF'], preferredFoot: 'R', age: 17, remarks: ['Game Sense', 'Dribbling'], team: 'White Knights FC', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '11', category: '3★', basePrice: '2pts', name: 'Tanish Gawade', preferredPosition: ['FW'], preferredFoot: 'R', age: 19, remarks: ['Finishing (in the box)'], team: 'Shadow Hawks', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '12', category: '3★', basePrice: '2pts', name: 'Sarthak Sharma', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: 15, remarks: ['Long passing'], team: 'White Knights FC', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '13', category: '3★', basePrice: '2pts', name: 'Amey Kawle', preferredPosition: ['FW'], preferredFoot: 'L', age: 15, remarks: ['Finishing (in the box)'], team: 'Dongre Super Kicks', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '14', category: '3★', basePrice: '2pts', name: 'Krish Mistry', preferredPosition: ['FW'], preferredFoot: 'R', age: 18, remarks: ['Dribbling', 'Finishing'], team: 'Red Devils', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '15', category: '3★', basePrice: '2pts', name: 'Arnav Chaudhary', preferredPosition: ['DEF'], preferredFoot: 'R', age: 19, remarks: ['Passing', 'Wall'], team: 'Shadow Hawks', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '16', category: '3★', basePrice: '2pts', name: 'Shubham Parulkar', preferredPosition: ['FW'], preferredFoot: 'R', age: 18, remarks: ['Dribbling', 'Speed'], team: 'Dongre Super Kicks', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '17', category: '3★', basePrice: '2pts', name: 'Paras Patil', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: 18, remarks: ['Game Sense', 'Passing'], team: 'White Knights FC', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '18', category: '3★', basePrice: '2pts', name: 'Parth Jadwani', preferredPosition: ['FW', 'DEF'], preferredFoot: 'R', age: 15, remarks: ['Passing', 'In the box'], team: 'Real Pawcelona', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '19', category: '3★', basePrice: '2pts', name: 'Satej Dhaiphule', preferredPosition: ['DEF'], preferredFoot: 'L', age: 20, remarks: ['Passing'], team: 'Dongre Super Kicks', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '20', category: '3★', basePrice: '2pts', name: 'Shreyas K', preferredPosition: ['DEF'], preferredFoot: 'R', age: 18, remarks: ['Passing'], team: 'Red Devils', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '21', category: '3★', basePrice: '2pts', name: 'Anish', preferredPosition: ['DEF'], preferredFoot: 'R', age: 16, remarks: ['Wall'], team: 'White Knights FC', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '22', category: '3★', basePrice: '2pts', name: 'Harshvardhan Jadwani', preferredPosition: ['DEF'], preferredFoot: 'R', age: 22, remarks: ['Physcial Strength', 'Long passing'], team: 'Red Devils', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '23', category: '3★', basePrice: '2pts', name: 'Ansh Bhardwaj', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 21, remarks: ['Passing', 'Game'], team: 'Real Pawcelona', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '24', category: '3★', basePrice: '2pts', name: 'Ayaan Ansaari', preferredPosition: ['FW', 'MF'], preferredFoot: 'R', age: 19, remarks: ['Dribbling', 'Positioning'], team: 'Real Pawcelona', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
  { id: '25', category: '3★', basePrice: '2pts', name: 'Harsh Daware', preferredPosition: ['DEF'], preferredFoot: 'L', age: 23, remarks: ['Passing'], team: 'Shadow Hawks', goals: 0, assists: 0, matchesPlayed: 0, matchesWon: 0, matchesLost: 0, yellowCards: 0, redCards: 0 },
];


const positionMapping: { [key: string]: string } = {
  'FW': 'Forward',
  'MF': 'Midfield',
  'DEF': 'Defence',
  'Over the field': 'Versatile'
};

const footMapping: { [key: string]: string } = {
  'R': 'Right',
  'L': 'Left',
};

const categoryColors: { [key: string]: string } = {
    '5★': 'border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    '4★': 'border-purple-300 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
    '3★': 'border-orange-300 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
};

function formatPosition(positions: string[]): string {
  return positions.map(p => positionMapping[p] || p).join(', ');
}

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};


export default function PlayersPage() {
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <motion.div
        className="flex justify-between items-center"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserSquare className="w-8 h-8 text-primary" />
          Players (Season 3)
        </h1>
      </motion.div>
      <motion.p
        className="text-muted-foreground"
        variants={itemVariants}
      >
        List of players participating in the current season. Click on a player row to view detailed stats.
      </motion.p>
      <motion.div variants={tableVariants}>
        <Card>
          <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] pl-4">Sr. No.</TableHead>
                  <TableHead>Player Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Foot</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right pr-4">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player, index) => (
                  <AccordionItem value={`player-${player.id}`} key={player.id} className="border-b last:border-b-0">
                    <AccordionTrigger asChild>
                      <TableRow className="hover:bg-muted/50 cursor-pointer w-full">
                        <TableCell className="font-medium pl-4">{player.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <Image
                                  src={`/images/players/player-${player.id}.jpg`}
                                  alt={`${player.name} avatar`}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                  data-ai-hint="player portrait soccer"
                                  priority={index < 5} 
                                  onError={(e) => {
                                      e.currentTarget.onerror = null; 
                                      e.currentTarget.src = `https://picsum.photos/seed/${player.id}/40/40`;
                                  }}
                                 />
                              <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-bold", categoryColors[player.category] ?? '')}>
                            {player.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{player.basePrice}</TableCell>
                        <TableCell>{formatPosition(player.preferredPosition)}</TableCell>
                        <TableCell>{footMapping[player.preferredFoot] ?? player.preferredFoot}</TableCell>
                        <TableCell>{player.age ?? 'N/A'}</TableCell>
                        <TableCell className="text-right pr-4">
                           {/* Chevron will be part of AccordionTrigger */}
                        </TableCell>
                      </TableRow>
                    </AccordionTrigger>
                    <AccordionContent asChild>
                     <TableRow className="bg-muted/5 dark:bg-muted/10">
                      <TableCell colSpan={8} className="p-0"> {/* Ensure colSpan matches number of columns */}
                        <motion.div
                          className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                            <h4 className="font-semibold text-sm flex items-center gap-1"><Users className="w-4 h-4 text-primary"/>Team</h4>
                            <p className="text-muted-foreground">{player.team}</p>
                          </div>
                          <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                            <h4 className="font-semibold text-sm flex items-center gap-1"><Goal className="w-4 h-4 text-primary"/>Goals</h4>
                            <p className="text-muted-foreground">{player.goals ?? 0}</p>
                          </div>
                          <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                            <h4 className="font-semibold text-sm flex items-center gap-1"><Zap className="w-4 h-4 text-primary"/>Assists</h4>
                            <p className="text-muted-foreground">{player.assists ?? 0}</p>
                          </div>
                          <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                            <h4 className="font-semibold text-sm flex items-center gap-1"><CalendarDays className="w-4 h-4 text-primary"/>Matches Played</h4>
                            <p className="text-muted-foreground">{player.matchesPlayed ?? 0}</p>
                          </div>
                          <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                            <h4 className="font-semibold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500"/>Matches Won</h4>
                            <p className="text-muted-foreground">{player.matchesWon ?? 0}</p>
                          </div>
                          <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                            <h4 className="font-semibold text-sm flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500"/>Matches Lost</h4>
                            <p className="text-muted-foreground">{player.matchesLost ?? 0}</p>
                          </div>
                        </motion.div>
                      </TableCell>
                      </TableRow>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </TableBody>
            </Table>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
       <motion.div
        className="mt-4 p-4 border rounded-lg bg-card" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }} // Adjusted delay
       >
          <h3 className="font-semibold mb-2 text-card-foreground">Key Abbreviations:</h3>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li><span className="font-medium">Over the field:</span> All playing positions</li>
            <li><span className="font-medium">FW:</span> Forward/Attacking</li>
            <li><span className="font-medium">MF:</span> Midfield</li>
            <li><span className="font-medium">DEF:</span> Defence</li>
            <li><span className="font-medium">R:</span> Right Footed</li>
            <li><span className="font-medium">L:</span> Left Footed</li>
            <li><span className="font-medium">Wall:</span> Good defending skills</li>
            <li><span className="font-medium">In the box:</span> Always stays forward</li>
          </ul>
        </motion.div>
    </motion.div>
  );
}
