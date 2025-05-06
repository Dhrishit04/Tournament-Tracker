import Link from 'next/link';
import { Users, Calendar, UserSquare, Menu as MenuIcon } from 'lucide-react'; // Added MenuIcon
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
           <Image
              src="https://picsum.photos/seed/dpl-logo/32/32"
              alt="Dongre Football Premier League Logo"
              width={32}
              height={32}
              className="rounded-full"
              data-ai-hint="football league logo soccer"
              priority // Keep priority as boolean for next/image
            />
          Dongre Football Premier League
        </Link>
        <div className="flex items-center gap-1 md:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="w-5 h-5" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/teams" className="flex items-center gap-2 cursor-pointer">
                  <Users className="w-4 h-4" />
                  Teams
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/matches" className="flex items-center gap-2 cursor-pointer">
                  <Calendar className="w-4 h-4" />
                  Matches
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/players" className="flex items-center gap-2 cursor-pointer">
                  <UserSquare className="w-4 h-4" />
                  Players
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Future links can be added here (e.g., Standings, Statistics) */}
        </div>
      </nav>
    </header>
  );
}
