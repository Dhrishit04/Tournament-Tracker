'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/utils';

export default function TeamsPage() {
    const { teams, loading } = useData();

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 font-headline">Teams</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="items-center p-6">
                                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                                <Skeleton className="h-6 w-3/4 mb-1" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="p-6">
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Teams</h1>
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team) => {
            const logo = getImageUrl(team.logoUrl);
            return (
              <Card key={team.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center text-center p-6 bg-secondary/50">
                    <div className="relative w-20 h-20 rounded-full mb-4 border-2 border-primary overflow-hidden">
                      <Image
                          src={logo.imageUrl}
                          alt={`${team.name} logo`}
                          fill
                          className="object-cover"
                          data-ai-hint={logo.imageHint}
                      />
                    </div>
                  <CardTitle className="font-bold">{team.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{team.owner}</p>
                </CardHeader>
                <CardContent className="p-6 flex-grow flex flex-col justify-between">
                  <div className="grid grid-cols-3 text-center mb-4">
                    <div>
                      <p className="font-bold text-lg">{team.stats.matchesPlayed}</p>
                      <p className="text-xs text-muted-foreground">Played</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-green-600">{team.stats.matchesWon}</p>
                      <p className="text-xs text-muted-foreground">Won</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-red-600">{team.stats.matchesLost}</p>
                      <p className="text-xs text-muted-foreground">Lost</p>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-auto">
                    <Link href={`/teams/${team.id}`}>
                      View Roster <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg bg-secondary/50">
            <p className="text-muted-foreground text-center">No teams found for this season. <br /> Add teams in the admin panel to get started.</p>
        </div>
      )}
    </div>
  );
}
