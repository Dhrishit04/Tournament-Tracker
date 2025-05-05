import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-card rounded-lg shadow">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-primary" />
          Welcome to Tournament Tracker Lite!
        </h1>
        <p className="text-lg text-muted-foreground">
          Your simple solution for tracking tournament progress.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">Explore the Tournament</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          {/* Add cards for Players, Standings, Statistics later */}
        </div>
      </section>

      <section className="text-center text-muted-foreground text-sm">
        <p>This is a simplified version. Future updates may include player profiles, detailed standings, and statistics.</p>
      </section>
    </div>
  );
}
