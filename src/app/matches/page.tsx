'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Removed CardDescription, CardTitle
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Mock data - replace with actual data fetching from Firestore later
const matches = [
  { id: 'm1', team1: 'Dongre Super Kicks', team2: 'Bravo Bears', date: new Date(2024, 7, 15, 14, 0), score1: 2, score2: 1, status: 'Finished' },
  { id: 'm2', team1: 'Charlie Cheetahs', team2: 'Delta Dragons', date: new Date(2024, 7, 15, 16, 0), status: 'Upcoming' },
  { id: 'm3', team1: 'Alpha Eagles', team2: 'Charlie Cheetahs', date: new Date(2024, 7, 17, 14, 0), status: 'Upcoming' },
  { id: 'm4', team1: 'Bravo Bears', team2: 'Delta Dragons', date: new Date(2024, 7, 17, 16, 0), score1: 0, score2: 0, status: 'Live' },
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
        className="space-y-4"
        variants={containerVariants} // Stagger children inside this div
      >
        {matches.map((match) => (
          <motion.div key={match.id} variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {format(match.date, 'EEE, MMM d, yyyy HH:mm')}
                  </span>
                </div>
                 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(match.status)}`}>
                  {match.status}
                 </span>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{match.team1}</span>
                  {match.status !== 'Upcoming' ? (
                    <span className="text-xl font-bold text-primary">
                      {match.score1 ?? '-'} : {match.score2 ?? '-'}
                    </span>
                  ) : (
                     <span className="text-lg font-semibold text-muted-foreground">vs</span>
                  )}
                  <span className="font-medium text-right">{match.team2}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
