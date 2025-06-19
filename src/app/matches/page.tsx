
'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Goal, RectangleVertical } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface MatchEvent {
  type: 'goal' | 'yellow_card' | 'red_card';
  player: string;
  teamName: string;
  minute?: number;
}

interface Match {
  id: string;
  team1Name: string;
  team2Name: string;
  date: Date;
  score1?: number;
  score2?: number;
  status: 'Finished' | 'Upcoming' | 'Live';
  events?: MatchEvent[];
}

// Mock data - replace with actual data fetching from Firestore later
const matches: Match[] = [
  {
    id: 'm1',
    team1Name: 'Red Devils', team2Name: 'Real Pawcelona',
    date: new Date(2024, 7, 15, 14, 0), score1: 2, score2: 1, status: 'Finished',
    events: [
      { type: 'goal', player: 'Shlok Desai', teamName: 'Red Devils', minute: 23 },
      { type: 'goal', player: 'Aarya Kawle', teamName: 'Real Pawcelona', minute: 40 },
      { type: 'goal', player: 'Nirvaan Sood', teamName: 'Red Devils', minute: 78 },
      { type: 'yellow_card', player: 'Hridant Sood', teamName: 'Real Pawcelona', minute: 55 },
    ]
  },
  {
    id: 'm2',
    team1Name: 'Shadow Hawks', team2Name: 'White Knights FC',
    date: new Date(2024, 7, 15, 16, 0), status: 'Upcoming',
    events: []
  },
  {
    id: 'm3',
    team1Name: 'Dongre Super Kicks', team2Name: 'Red Devils',
    date: new Date(2024, 7, 17, 14, 0), status: 'Upcoming',
    events: []
  },
  {
    id: 'm4',
    team1Name: 'Real Pawcelona', team2Name: 'Shadow Hawks',
    date: new Date(2024, 7, 17, 16, 0), score1: 0, score2: 0, status: 'Live',
    events: [
      { type: 'yellow_card', player: 'Aaron Dsouza', teamName: 'Shadow Hawks', minute: 30 },
      { type: 'red_card', player: 'Deep Patel', teamName: 'Shadow Hawks', minute: 65 },
    ]
  },
];

function getStatusBadgeColor(status: string) {
  switch (status.toLowerCase()) {
    case 'finished': return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    case 'live': return 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200 animate-pulse';
    case 'upcoming': return 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200';
    default: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export default function MatchesPage() {
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
        <Calendar className="w-8 h-8 text-primary" />
        Matches
      </motion.h1>
      <motion.div 
        className="w-full" // Changed from space-y-4, Accordion will handle item spacing
        variants={containerVariants} // Stagger children inside this div
      >
        <Accordion type="single" collapsible className="w-full space-y-4">
          {matches.map((match) => (
            <motion.div key={match.id} variants={itemVariants}>
              <Card className="overflow-hidden rounded-lg shadow-md">
                <AccordionItem value={`match-${match.id}`} className="border-b-0">
                  <AccordionTrigger className="w-full text-left hover:no-underline p-0 focus:outline-none group">
                    <div className="p-4 w-full">
                      <div className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50 -mx-4 -mt-4 p-4 mb-2 rounded-t-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {format(match.date, 'EEE, MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(match.status)}`}>
                          {match.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{match.team1Name}</span>
                        {match.status !== 'Upcoming' ? (
                          <span className="text-xl font-bold text-primary">
                            {match.score1 ?? '-'} : {match.score2 ?? '-'}
                          </span>
                        ) : (
                          <span className="text-lg font-semibold text-muted-foreground">vs</span>
                        )}
                        <span className="font-medium text-right">{match.team2Name}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-0 pb-4">
                    <div>
                      {(!match.events || match.events.length === 0) ? (
                        <p className="text-sm text-muted-foreground">No match events recorded.</p>
                      ) : (
                        <div className="space-y-3 pt-2">
                          {match.events.some(e => e.type === 'goal') && (
                            <div>
                              <h4 className="font-semibold text-sm flex items-center gap-1 mb-1">
                                <Goal className="w-4 h-4 text-green-500" /> Goals
                              </h4>
                              <ul className="list-disc list-inside pl-5 text-sm text-muted-foreground space-y-0.5">
                                {match.events.filter(e => e.type === 'goal').map((event, idx) => (
                                  <li key={`goal-${idx}`}>{event.player} ({event.teamName}){event.minute ? ` ${event.minute}'` : ''}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {match.events.some(e => e.type === 'yellow_card') && (
                            <div>
                              <h4 className="font-semibold text-sm flex items-center gap-1 mb-1">
                                <RectangleVertical className="w-3 h-4 text-yellow-500" /> Yellow Cards
                              </h4>
                              <ul className="list-disc list-inside pl-5 text-sm text-muted-foreground space-y-0.5">
                                {match.events.filter(e => e.type === 'yellow_card').map((event, idx) => (
                                  <li key={`yellow-${idx}`}>{event.player} ({event.teamName}){event.minute ? ` ${event.minute}'` : ''}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {match.events.some(e => e.type === 'red_card') && (
                            <div>
                              <h4 className="font-semibold text-sm flex items-center gap-1 mb-1">
                                <RectangleVertical className="w-3 h-4 text-red-600" /> Red Cards
                              </h4>
                              <ul className="list-disc list-inside pl-5 text-sm text-muted-foreground space-y-0.5">
                                {match.events.filter(e => e.type === 'red_card').map((event, idx) => (
                                  <li key={`red-${idx}`}>{event.player} ({event.teamName}){event.minute ? ` ${event.minute}'` : ''}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </motion.div>
  );
}
