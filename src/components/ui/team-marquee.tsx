'use client';
import { useData } from '@/hooks/use-data';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

export function TeamMarquee() {
    const { teams, loading } = useData();

    if (loading || !teams || teams.length === 0) return null;

    return (
        <div className="relative flex w-full overflow-hidden bg-background py-10 border-t border-white/5">
            <div className="absolute inset-y-0 left-0 w-1/4 md:w-1/3 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-1/4 md:w-1/3 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex w-fit animate-marquee-linear items-center gap-16 whitespace-nowrap pl-16 hover:[animation-play-state:paused]">
                {[...teams, ...teams, ...teams, ...teams].map((team, idx) => {
                    const logo = getImageUrl(team.logoUrl);
                    return (
                        <div key={`${team.id}-${idx}`} className="flex items-center gap-4 group opacity-50 hover:opacity-100 transition-opacity duration-300">
                            <div className="relative w-10 h-10 md:w-12 md:h-12 grayscale group-hover:grayscale-0 transition-all duration-300">
                                <Image src={logo.imageUrl} alt={team.name} fill className="object-contain" />
                            </div>
                            <span className="font-bold uppercase tracking-widest text-xs md:text-sm text-muted-foreground group-hover:text-primary transition-colors">{team.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
