'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from './header';

const columns = [
  { title: 'League', links: [['/standings', 'Standings'], ['/matches', 'Matches'], ['/brackets', 'Brackets'], ['/stats', 'Stats']] },
  { title: 'Clubs', links: [['/teams', 'Teams'], ['/players', 'Players'], ['/about', 'About']] },
  { title: 'Administration', links: [['/admin-auth', 'Admin portal'], ['/privacy', 'Privacy policy'], ['/terms', 'Terms of service']] },
];

export function Footer() {
  // the landing document carries its own colophon
  if (usePathname() === '/') return null;

  return (
    <footer className="k-foot">
      <div className="grid grid-cols-1 gap-[clamp(22px,4vw,60px)] sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,.6fr))]">
        <div>
          <BrandMark className="h-[34px] w-[34px]" />
          <p className="mt-4 max-w-[34ch] text-[13px] text-[#79847e]">The official record of the Dongre Football Premier League, from the first fixture to the final table.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>{col.links.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="k-label mt-[clamp(38px,6vh,74px)] flex flex-wrap items-center justify-between gap-5 border-t border-[rgba(223,231,224,.07)] pt-5 tracking-[.16em] text-muted-foreground">
        <span>© {new Date().getFullYear()} Dongre Football Premier League</span>
        <span>Built for a clearer season</span>
        <span>Tournament Tracker</span>
      </div>
    </footer>
  );
}
