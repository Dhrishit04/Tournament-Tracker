import Link from 'next/link';
import { Users, Calendar, UserSquare } from 'lucide-react'; // Removed Trophy icon
import { Button } from '@/components/ui/button';
import Image from 'next/image'; // Import Image component

export function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
           {/* Added Image component for the logo */}
           <Image
              src="https://picsum.photos/seed/dpl-logo/32/32" // Placeholder, actual logo path needed
              alt="Dongre Premier League Logo"
              width={32} // Adjust size as needed
              height={32}
              className="rounded-full" // Optional: if the logo should be circular
              data-ai-hint="football league logo soccer" // Hint for finding the actual logo
            />
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
