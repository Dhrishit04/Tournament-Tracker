'use client';

import { useAbout } from '@/hooks/use-about';
import { Skeleton } from '@/components/ui/skeleton';
import { detectPlatform, getSocialHref } from '@/lib/social-utils';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { FadeUp } from '@/components/ui/animations';
import type { AboutPosition, TeamMember, SocialLink } from '@/types';

// template [data-rv="up"]: 26px rise on the Kage ease
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.085 } },
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

function MemberCard({ member }: { member: TeamMember }) {
  // Firebase Storage intermittently 500s the image optimizer's fetch; fall back to the original file once.
  const [direct, setDirect] = useState(false);
  return (
    <motion.article variants={fadeUp} className="group flex flex-col">
      {/* template .card-fr: a hairline frame with the name set on the image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-card outline outline-1 -outline-offset-1 outline-[rgba(223,231,224,.07)] transition-[outline-color] duration-500 group-hover:outline-[rgba(223,231,224,.3)]">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            unoptimized={direct}
            onError={() => setDirect(true)}
            className="object-cover brightness-[.85] saturate-[.85] transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="h-14 w-14 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,9,.04)_40%,rgba(3,6,9,.8)_100%)]" />
        <h3 className="absolute inset-x-4 bottom-3.5 text-[clamp(14px,1.2vw,18px)] uppercase leading-tight tracking-[.02em] text-foreground">
          {member.name}
        </h3>
      </div>

      {member.description && (
        <p className="mt-3 break-words text-sm font-light leading-[1.68] text-[#9aa5a0]">{member.description}</p>
      )}

      <div className="flex-grow" />
      {member.socialLinks?.length > 0 && (
        <div className="mt-4 flex items-center gap-2.5">
          {member.socialLinks.map((link: SocialLink, i: number) => {
            const { icon: Icon, label } = detectPlatform(link.url);
            return (
              // template .arrowlink .ar: a hairline ring that floods bone on hover
              <a
                key={i}
                href={getSocialHref(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                aria-label={label}
                className="grid h-[34px] w-[34px] place-items-center rounded-full border border-[rgba(223,231,224,.13)] text-[hsl(var(--bone-dim))] transition-colors duration-500 hover:border-foreground hover:bg-foreground hover:text-background"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            );
          })}
        </div>
      )}
    </motion.article>
  );
}

export default function AboutPage() {
  const { positions, members, loading } = useAbout();

  const rows = loading ? [] : packIntoRows(positions, members);
  let groupNo = 0;

  return (
    <div className="container relative z-10 mx-auto max-w-7xl px-4 py-24">
      <div className="mb-[clamp(46px,8vh,96px)] grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,.72fr)]">
        <div>
          <FadeUp delay={0.1}>
            <h1 className="text-4xl font-black md:text-6xl">
              About <span className="text-gradient-purple">Us</span>
            </h1>
          </FadeUp>
          <div className="k-eyebrow">The Committee</div>
        </div>
        <p className="max-w-[44ch] text-[clamp(14px,1.02vw,17px)] font-light leading-[1.72] text-[#b4bfb7]">
          Meet the people behind the Dongre Football Premier League, from the fixtures and the
          rulings to the touchline on match day.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)}
        </div>
      )}

      {!loading && members.length === 0 && (
        <p className="py-20 text-center text-muted-foreground">No team members have been added yet.</p>
      )}

      <div className="space-y-[clamp(46px,8vh,96px)]">
        {rows.map((row, rowIdx) => {
          // Total members in this row determines how wide each group stretches
          const totalInRow = row.reduce((s, g) => s + g.posMembers.length, 0);

          return (
            <div key={rowIdx} className="flex flex-col gap-[clamp(28px,4vw,60px)] md:flex-row">
              {row.map(({ position, posMembers }) => {
                const widthPercent = Math.round((posMembers.length / totalInRow) * 100);
                const no = String(++groupNo).padStart(2, '0');

                return (
                  <motion.section
                    key={position.id}
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-50px' }}
                    className="flex min-w-0 flex-col"
                    style={{ flex: `0 0 calc(${widthPercent}% - ${(row.length - 1) * 40 / row.length}px)` }}
                  >
                    {/* template .sec-head: number — title, then a hairline rule */}
                    <motion.div variants={fadeUp} className="mb-6 flex items-baseline gap-4">
                      <h2 className="k-label shrink-0 tracking-[.24em] text-muted-foreground">
                        <b className="font-medium text-primary">{no}</b> — {position.title}
                      </h2>
                      <span className="h-px flex-1 bg-[rgba(223,231,224,.07)]" />
                    </motion.div>

                    <div className={`grid gap-[clamp(14px,1.6vw,26px)] ${posMembers.length === 1
                      ? 'grid-cols-1'
                      : posMembers.length === 2
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      }`}>
                      {posMembers.map((member) => <MemberCard key={member.id} member={member} />)}
                    </div>
                  </motion.section>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
