import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

// Mock data - replace with actual data fetching from Firestore later
const matches = [
  { id: 'm1', team1: 'Alpha Eagles', team2: 'Bravo Bears', date: new Date(2024, 7, 15, 14, 0), score1: 2, score2: 1, status: 'Finished' },
  { id: 'm2', team1: 'Charlie Cheetahs', team2: 'Delta Dragons', date: new Date(2024, 7, 15, 16, 0), status: 'Upcoming' },
  { id: 'm3', team1: 'Alpha Eagles', team2: 'Charlie Cheetahs', date: new Date(2024, 7, 17, 14, 0), status: 'Upcoming' },
  { id: 'm4', team1: 'Bravo Bears', team2: 'Delta Dragons', date: new Date(2024, 7, 17, 16, 0), score1: 0, score2: 0, status: 'Live' },
];

function getStatusBadgeColor(status: string) {
  switch (status.toLowerCase()) {
    case 'finished': return 'bg-gray-200 text-gray-800';
    case 'live': return 'bg-red-200 text-red-800 animate-pulse';
    case 'upcoming': return 'bg-blue-200 text-blue-800';
    default: return 'bg-gray-200 text-gray-800';
  }
}

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Calendar className="w-8 h-8 text-primary" />
        Matches
      </h1>
      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id} className="overflow-hidden">
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
        ))}
      </div>
    </div>
  );
}
