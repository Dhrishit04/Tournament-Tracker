'use client';

import { useAbout } from '@/hooks/use-about';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { detectPlatform, getSocialHref } from '@/lib/social-utils';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import type { AboutPosition, TeamMember, SocialLink } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/**
 * Greedily pack position-groups into rows so total members per row ≤ 3.
 * Same-role members are NEVER split across rows.
 */
function packIntoRows(
  positions: AboutPosition[],
  members: TeamMember[]
): { position: AboutPosition; posMembers: TeamMember[] }[][] {
  const groups = positions
    .map((p) => ({
      position: p,
      posMembers: members.filter((m) => m.positionId === p.id),
    }))
    .filter((g) => g.posMembers.length > 0);

  const rows: typeof groups[] = [];
  let currentRow: typeof groups = [];
  let currentCount = 0;

  for (const group of groups) {
    const count = group.posMembers.length;
    if (currentRow.length === 0) {
      // First group in a row always goes in
      currentRow.push(group);
      currentCount = count;
    } else if (currentCount + count <= 3) {
      // Fits in the current row
      currentRow.push(group);
      currentCount += count;
    } else {
      // Doesn't fit — flush current row and start a new one
      rows.push(currentRow);
      currentRow = [group];
      currentCount = count;
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);

  return rows;
}

export default function AboutPage() {
  const { positions, members, loading } = useAbout();

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-24 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const rows = packIntoRows(positions, members);
  const totalMembers = members.length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-4 py-24 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-5 py-2 text-sm font-bold tracking-widest uppercase text-accent border border-accent/20 mb-8">
            <Users className="h-4 w-4" />
            The Team
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">Us</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Meet the passionate people behind the Dongre Football Premier League
          </p>
        </motion.div>

        {totalMembers === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No team members have been added yet.</p>
          </div>
        )}

        {/* Rows of position-groups */}
        <div className="max-w-7xl mx-auto space-y-12">
          {rows.map((row, rowIdx) => {
            // Total members in this row determines how wide each group stretches
            const totalInRow = row.reduce((s, g) => s + g.posMembers.length, 0);

            return (
              <motion.div
                key={rowIdx}
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-50px' }}
                className="flex flex-col md:flex-row gap-8"
              >
                {row.map(({ position, posMembers }) => {
                  // Each group takes proportional width based on member count
                  const fraction = posMembers.length / totalInRow;
                  const widthPercent = Math.round(fraction * 100);

                  return (
                    <motion.div
                      key={position.id}
                      variants={fadeUp}
                      className="flex-shrink-0 flex flex-col"
                      style={{ flex: `0 0 calc(${widthPercent}% - ${(row.length - 1) * 32 / row.length}px)`, minWidth: 0 }}
                    >
                      {/* Position group box with subtle glowing outline */}
                      <div className="rounded-2xl border border-accent/20 p-6 shadow-[0_0_20px_rgba(139,92,246,0.06)] bg-card/30 backdrop-blur-sm h-full flex flex-col">
                        {/* Position heading */}
                        <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground mb-6 text-center">
                          {position.title}
                        </h2>

                        {/* Member cards grid inside the group */}
                        <div className={`grid gap-6 ${posMembers.length === 1
                            ? 'grid-cols-1'
                            : posMembers.length === 2
                              ? 'grid-cols-1 sm:grid-cols-2'
                              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                          }`}>
                          {posMembers.map((member: TeamMember) => (
                            <Card
                              key={member.id}
                              className="group relative overflow-hidden rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm hover:border-accent/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)] h-full flex flex-col"
                            >
                              {/* Photo */}
                              <div className="relative w-full aspect-[4/5] overflow-hidden bg-secondary/20 shrink-0">
                                {member.photoUrl ? (
                                  <Image
                                    src={member.photoUrl}
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Users className="h-16 w-16 text-muted-foreground/30" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                              </div>

                              {/* Content */}
                              <CardContent className="px-5 py-4 flex flex-col flex-grow">
                                <h3 className="text-lg font-black tracking-tight text-foreground mb-1">
                                  {member.name}
                                </h3>
                                {member.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed text-justify mb-2 break-words">
                                    {member.description}
                                  </p>
                                )}
                                {/* Spacer */}
                                <div className="flex-grow" />
                                {/* Social links */}
                                <div className="flex items-center gap-3 pt-2 min-h-[36px]">
                                  {member.socialLinks?.length > 0 &&
                                    member.socialLinks.map((link: SocialLink, i: number) => {
                                      const { icon: Icon, label } = detectPlatform(link.url);
                                      return (
                                        <a
                                          key={i}
                                          href={getSocialHref(link.url)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title={label}
                                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-accent hover:border-accent/30 hover:bg-accent/10 transition-all duration-300"
                                        >
                                          <Icon className="h-4 w-4" />
                                        </a>
                                      );
                                    })}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
