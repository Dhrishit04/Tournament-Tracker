import Link from 'next/link';
import { Trophy, Users, Calendar, UserSquare } from 'lucide-react'; // Added UserSquare
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Trophy className="w-6 h-6" />
          Dongre Football Premier League
        </Link>
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" asChild>
            <Link href="/teams" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Teams
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/matches" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Matches
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/players" className="flex items-center gap-1">
              <UserSquare className="w-4 h-4" />
              Players
            </Link>
          </Button>
          {/* Future links can be added here (e.g., Standings, Statistics) */}
        </div>
      </nav>
    </header>
  );
}
