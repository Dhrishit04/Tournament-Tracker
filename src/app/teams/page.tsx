import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Crown } from 'lucide-react'; // Added Crown icon for owner
import Image from 'next/image';

// Mock data - replace with actual data fetching from Firestore later
// Added owner property and updated to 5 teams
const teams = [
  { id: 't1', name: 'Alpha Eagles', owner: 'Mr. Alpha', logo: '/placeholder-logo.png', players: ['Player A1', 'Player A2', 'Player A3'] },
  { id: 't2', name: 'Bravo Bears', owner: 'Ms. Bravo', logo: '/placeholder-logo.png', players: ['Player B1', 'Player B2'] },
  { id: 't3', name: 'Charlie Cheetahs', owner: 'Dr. Charlie', logo: '/placeholder-logo.png', players: ['Player C1', 'Player C2', 'Player C3'] },
  { id: 't4', name: 'Delta Dragons', owner: 'Prof. Delta', logo: '/placeholder-logo.png', players: ['Player D1', 'Player D2'] },
  { id: 't5', name: 'Echo Foxes', owner: 'Capt. Echo', logo: '/placeholder-logo.png', players: ['Player E1', 'Player E2', 'Player E3'] },
];

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Users className="w-8 h-8 text-primary" />
        Teams
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Adjusted gap */}
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
                    data-ai-hint="team logo sport crest" // Updated hint
                  />
                  <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              {/* Wrapped title and owner in a div for better layout */}
              <div className="flex flex-col">
                <CardTitle>{team.name}</CardTitle>
                 <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Crown className="w-4 h-4" />
                    <span>{team.owner}</span>
                  </div>
              </div>
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
