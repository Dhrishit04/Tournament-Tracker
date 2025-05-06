'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserSquare, TrendingUp, Shield, Zap, Star, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';

// Mock data - replace with actual data fetching from Firestore later
const players = [
  // ... (existing player data with added stats)
  { id: '1', category: '5★', basePrice: '10pts', name: 'Shlok Desai', preferredPosition: ['Over the field'], preferredFoot: 'R', age: null, remarks: ['Captaincy', 'Physcial Strength'], team: 'Alpha Eagles', goals: 5, assists: 3, matchesPlayed: 10, matchesWon: 7, matchesLost: 3 },
  { id: '2', category: '5★', basePrice: '10pts', name: 'Aarya Kawle', preferredPosition: ['FW', 'MF'], preferredFoot: 'R', age: 21, remarks: ['Captaincy', 'Game Sense'], team: 'Bravo Bears', goals: 8, assists: 5, matchesPlayed: 10, matchesWon: 6, matchesLost: 4 },
  { id: '3', category: '5★', basePrice: '10pts', name: 'Dhrishit', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: 20, remarks: ['Playmaking', 'Team player'], team: 'Charlie Cheetahs', goals: 2, assists: 7, matchesPlayed: 9, matchesWon: 5, matchesLost: 4 },
  { id: '4', category: '5★', basePrice: '10pts', name: 'Vikram', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: null, remarks: ['Playmaking', 'Team player'], team: 'Delta Dragons', goals: 1, assists: 6, matchesPlayed: 10, matchesWon: 4, matchesLost: 6 },
  { id: '5', category: '5★', basePrice: '10pts', name: 'Aaron', preferredPosition: ['FW', 'MF'], preferredFoot: 'R', age: 23, remarks: ['Finishing', 'Skills'], team: 'Echo Foxes', goals: 10, assists: 2, matchesPlayed: 9, matchesWon: 8, matchesLost: 1 },
  { id: '6', category: '4★', basePrice: '6pts', name: 'Arjun Desai', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 17, remarks: ['All rounder'], team: 'Alpha Eagles', goals: 3, assists: 4, matchesPlayed: 8, matchesWon: 6, matchesLost: 2 },
  { id: '7', category: '4★', basePrice: '6pts', name: 'Hridant Sood', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 17, remarks: ['Dribbling', 'Passing'], team: 'Bravo Bears', goals: 4, assists: 5, matchesPlayed: 9, matchesWon: 5, matchesLost: 4 },
  { id: '8', category: '4★', basePrice: '6pts', name: 'Deep', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 22, remarks: ['Positioning', 'Long passing'], team: 'Charlie Cheetahs', goals: 1, assists: 3, matchesPlayed: 7, matchesWon: 4, matchesLost: 3 },
  { id: '9', category: '4★', basePrice: '6pts', name: 'Nirvaan Sood', preferredPosition: ['Over the field'], preferredFoot: 'R', age: 22, remarks: ['Captaincy', 'Team player'], team: 'Delta Dragons', goals: 2, assists: 2, matchesPlayed: 8, matchesWon: 3, matchesLost: 5 },
  { id: '10', category: '4★', basePrice: '6pts', name: 'Atharva Sawant', preferredPosition: ['FW', 'MF'], preferredFoot: 'R', age: 17, remarks: ['Game Sense', 'Dribbling'], team: 'Echo Foxes', goals: 6, assists: 4, matchesPlayed: 9, matchesWon: 7, matchesLost: 2 },
  { id: '11', category: '3★', basePrice: '2pts', name: 'Tanish Gawade', preferredPosition: ['FW'], preferredFoot: 'R', age: 19, remarks: ['Finishing (in the box)'], team: 'Alpha Eagles', goals: 7, assists: 1, matchesPlayed: 7, matchesWon: 5, matchesLost: 2 },
  { id: '12', category: '3★', basePrice: '2pts', name: 'Sarthak Sharma', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: 15, remarks: ['Long passing'], team: 'Bravo Bears', goals: 0, assists: 2, matchesPlayed: 6, matchesWon: 3, matchesLost: 3 },
  { id: '13', category: '3★', basePrice: '2pts', name: 'Amey Kawle', preferredPosition: ['FW'], preferredFoot: 'L', age: 15, remarks: ['Finishing (in the box)'], team: 'Charlie Cheetahs', goals: 5, assists: 0, matchesPlayed: 5, matchesWon: 2, matchesLost: 3 },
  { id: '14', category: '3★', basePrice: '2pts', name: 'Krish Mistry', preferredPosition: ['FW'], preferredFoot: 'R', age: 18, remarks: ['Dribbling', 'Finishing'], team: 'Delta Dragons', goals: 3, assists: 1, matchesPlayed: 6, matchesWon: 2, matchesLost: 4 },
  { id: '15', category: '3★', basePrice: '2pts', name: 'Arnav Chaudhary', preferredPosition: ['DEF'], preferredFoot: 'R', age: 19, remarks: ['Passing', 'Wall'], team: 'Echo Foxes', goals: 0, assists: 1, matchesPlayed: 7, matchesWon: 5, matchesLost: 2 },
  { id: '16', category: '3★', basePrice: '2pts', name: 'Shubham Parulkar', preferredPosition: ['FW'], preferredFoot: 'R', age: 18, remarks: ['Dribbling', 'Speed'], team: 'Alpha Eagles', goals: 4, assists: 2, matchesPlayed: 5, matchesWon: 3, matchesLost: 2 },
  { id: '17', category: '3★', basePrice: '2pts', name: 'Paras Patil', preferredPosition: ['MF', 'DEF'], preferredFoot: 'R', age: 18, remarks: ['Game Sense', 'Passing'], team: 'Bravo Bears', goals: 1, assists: 3, matchesPlayed: 7, matchesWon: 4, matchesLost: 3 },
  { id: '18', category: '3★', basePrice: '2pts', name: 'Parth Jadwani', preferredPosition: ['FW', 'DEF'], preferredFoot: 'R', age: 15, remarks: ['Passing', 'In the box'], team: 'Charlie Cheetahs', goals: 2, assists: 1, matchesPlayed: 4, matchesWon: 1, matchesLost: 3 },
  { id: '19', category: '3★', basePrice: '2pts', name: 'Satej Dhaiphule', preferredPosition: ['DEF'], preferredFoot: 'L', age: null, remarks: ['Passing'], team: 'Delta Dragons', goals: 0, assists: 0, matchesPlayed: 5, matchesWon: 1, matchesLost: 4 },
  { id: '20', category: '3★', basePrice: '2pts', name: 'Shreyas K', preferredPosition: ['DEF'], preferredFoot: 'R', age: null, remarks: ['Passing'], team: 'Echo Foxes', goals: 0, assists: 1, matchesPlayed: 6, matchesWon: 4, matchesLost: 2 },
  { id: '21', category: '3★', basePrice: '2pts', name: 'Anish', preferredPosition: ['DEF'], preferredFoot: 'R', age: null, remarks: ['Wall'], team: 'Alpha Eagles', goals: 0, assists: 0, matchesPlayed: 3, matchesWon: 2, matchesLost: 1 },
  { id: '22', category: '3★', basePrice: '2pts', name: 'Harshvardhan', preferredPosition: ['DEF'], preferredFoot: 'R', age: 22, remarks: ['Physcial Strength', 'Long passing'], team: 'Bravo Bears', goals: 0, assists: 1, matchesPlayed: 6, matchesWon: 3, matchesLost: 3 },
  { id: '23', category: '3★', basePrice: '2pts', name: 'Rauneet Singh', preferredPosition: ['FW'], preferredFoot: 'R', age: null, remarks: ['Dribbling'], team: 'Charlie Cheetahs', goals: 2, assists: 0, matchesPlayed: 4, matchesWon: 1, matchesLost: 3 },
  { id: '24', category: '3★', basePrice: '2pts', name: 'Ayaan Ansaari', preferredPosition: ['FW', 'MF'], preferredFoot: 'R', age: null, remarks: ['Dribbling', 'Positioning'], team: 'Delta Dragons', goals: 1, assists: 2, matchesPlayed: 5, matchesWon: 1, matchesLost: 4 },
  { id: '25', category: '3★', basePrice: '2pts', name: 'Player 25', preferredPosition: ['DEF'], preferredFoot: 'R', age: null, remarks: [], team: 'Echo Foxes', goals: 0, assists: 0, matchesPlayed: 2, matchesWon: 1, matchesLost: 1 },
];


const positionMapping: { [key: string]: string } = {
  'Over the field': 'All Positions',
  'FW': 'Forward',
  'MF': 'Midfield',
  'DEF': 'Defence',
};

const footMapping: { [key: string]: string } = {
  'R': 'Right',
  'L': 'Left',
};

const categoryColors: { [key: string]: string } = {
    '5★': 'border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    '4★': 'border-purple-300 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
    '3★': 'border-orange-300 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
}

function formatPosition(positions: string[]): string {
  return positions.map(p => positionMapping[p] || p).join(', ');
}

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
};

const accordionContentVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeInOut" } },
};


export default function PlayersPage() {
  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserSquare className="w-8 h-8 text-primary" />
          Players (Season 3)
        </h1>
      </div>
      <p className="text-muted-foreground">
        List of players participating in the current season. Click on a player to view detailed stats.
      </p>
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
                    <TableHead className="pr-4">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player, index) => (
                    <AccordionItem value={`item-${index}`} key={player.id} className="border-b-0">
                      <AccordionTrigger asChild>
                        <TableRow className="cursor-pointer hover:bg-muted/50 data-[state=open]:bg-muted/60">
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
                                    onError={(e) => e.currentTarget.src = `https://picsum.photos/seed/${player.id}/40/40`} // Fallback
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
                          <TableCell className="pr-4">
                            <div className="flex flex-wrap gap-1">
                              {player.remarks.map((remark, idx) => (
                                <Badge key={idx} variant="secondary">{remark}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      </AccordionTrigger>
                      <AccordionContent asChild>
                        <motion.tr 
                          className="bg-muted/20 dark:bg-muted/10"
                          variants={accordionContentVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden" // Added exit for smoother closing animation
                        >
                          <TableCell colSpan={8} className="p-0">
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                                <h4 className="font-semibold text-sm flex items-center gap-1"><Users className="w-4 h-4 text-primary"/>Team</h4>
                                <p className="text-muted-foreground">{player.team}</p>
                              </div>
                              <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                                <h4 className="font-semibold text-sm flex items-center gap-1"><TrendingUp className="w-4 h-4 text-primary"/>Goals</h4>
                                <p className="text-muted-foreground">{player.goals}</p>
                              </div>
                              <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                                <h4 className="font-semibold text-sm flex items-center gap-1"><Zap className="w-4 h-4 text-primary"/>Assists</h4>
                                <p className="text-muted-foreground">{player.assists}</p>
                              </div>
                              <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                                <h4 className="font-semibold text-sm flex items-center gap-1"><CalendarDays className="w-4 h-4 text-primary"/>Matches Played</h4>
                                <p className="text-muted-foreground">{player.matchesPlayed}</p>
                              </div>
                              <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                                <h4 className="font-semibold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500"/>Matches Won</h4>
                                <p className="text-muted-foreground">{player.matchesWon}</p>
                              </div>
                              <div className="space-y-1 p-3 bg-card rounded-md shadow-sm">
                                <h4 className="font-semibold text-sm flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500"/>Matches Lost</h4>
                                <p className="text-muted-foreground">{player.matchesLost}</p>
                              </div>
                            </div>
                          </TableCell>
                        </motion.tr>
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
        className="mt-4 p-4 border rounded-lg bg-muted/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
       >
          <h3 className="font-semibold mb-2">Key Abbreviations:</h3>
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
