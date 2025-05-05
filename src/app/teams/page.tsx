import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import Image from 'next/image';

// Mock data - replace with actual data fetching from Firestore later
const teams = [
  { id: '1', name: 'Alpha Eagles', logo: '/placeholder-logo.png', players: ['Player A1', 'Player A2'] },
  { id: '2', name: 'Bravo Bears', logo: '/placeholder-logo.png', players: ['Player B1', 'Player B2'] },
  { id: '3', name: 'Charlie Cheetahs', logo: '/placeholder-logo.png', players: ['Player C1', 'Player C2'] },
  { id: '4', name: 'Delta Dragons', logo: '/placeholder-logo.png', players: ['Player D1', 'Player D2'] },
];

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Users className="w-8 h-8 text-primary" />
        Teams
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Avatar className="h-12 w-12">
                  {/* Use placeholder image, replace logo path later */}
                  <Image
                    src={`https://picsum.photos/seed/${team.id}/48/48`}
                    alt={`${team.name} Logo`}
                    width={48}
                    height={48}
                    className="rounded-full"
                    data-ai-hint="team logo sport"
                  />
                  <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              <CardTitle>{team.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {/* Displaying player count as a simple profile detail for now */}
                {team.players.length} Players
              </p>
              {/* Add more details or a link to a full team profile later */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
