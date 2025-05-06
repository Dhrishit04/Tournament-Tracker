'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, UserSquare, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';


function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null to avoid hydration mismatch
    return (
      <Button variant="outline" size="icon" disabled aria-label="Loading theme switcher">
        <Sun className="h-[1.2rem] w-[1.2rem]" /> {/* Or a generic loading icon */}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {theme === 'light' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
    </Button>
  );
}

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-card rounded-lg shadow relative">
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
           <Image
              src="https://picsum.photos/seed/dpl-logo/40/40"
              alt="Dongre Premier League Logo"
              width={40}
              height={40}
              className="rounded-full"
              data-ai-hint="football league logo soccer"
            />
          Dongre Football Premier League
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome to the official tracker for the Dongre Football Premier League!
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">Explore the League</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
      </section>
      
      <section className="text-center text-muted-foreground text-sm">
        <p>Currently tracking Season 3. Stay tuned for live updates, standings, and detailed statistics!</p>
      </section>
    </div>
  );
}
