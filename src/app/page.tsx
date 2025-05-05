import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, UserSquare } from 'lucide-react'; // Added UserSquare

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-card rounded-lg shadow">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-primary" />
          Dongre Football Premier League
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome to the official tracker for the Dongre Football Premier League!
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">Explore the League</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Changed to 3 cols */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Teams
              </CardTitle>
              <CardDescription>View participating teams and their details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/teams">Go to Teams</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Matches
              </CardTitle>
              <CardDescription>Check the schedule and results of matches.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/matches">Go to Matches</Link>
              </Button>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserSquare className="w-5 h-5 text-primary" />
                Players
              </CardTitle>
              <CardDescription>Browse player profiles and season info.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/players">Go to Players</Link>
              </Button>
            </CardContent>
          </Card>
          {/* Add cards for Standings, Statistics later */}
        </div>
      </section>

      <section className="text-center text-muted-foreground text-sm">
        <p>Currently tracking Season 3. Stay tuned for live updates, standings, and detailed statistics!</p>
      </section>
    </div>
  );
}
