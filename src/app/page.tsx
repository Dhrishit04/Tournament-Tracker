'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { useSeason } from '@/contexts/season-context';
import { useData } from '@/hooks/use-data';
import { useAbout } from '@/hooks/use-about';

function AnnouncementBanner() {
  const { globalAnnouncement } = useSeason();

  if (!globalAnnouncement?.isActive || !globalAnnouncement.message) return null;

  return (
    <div className="flex h-11 shrink-0 items-center overflow-hidden border-t border-border bg-background">
      <div className="relative z-10 flex h-full items-center gap-3 border-r border-border bg-background px-6">
        <span className="h-[5px] w-[5px] rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
        <span className="k-label text-foreground">Broadcast</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex animate-marquee items-center gap-12 whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-12">
              <p className="k-label text-[hsl(var(--bone-dim))]">{globalAnnouncement.message}</p>
              <span className="text-primary">·</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// shown when no management photos have been uploaded (same image the previous landing used)
const STADIUM_FALLBACK = 'https://images.unsplash.com/photo-1518605368461-1ee7e543666b?q=80&w=2940&auto=format&fit=crop';

const points = (s: { matchesWon?: number; matchesDrawn?: number }) => (s.matchesWon || 0) * 3 + (s.matchesDrawn || 0);
const goalDiff = (s: { totalGoals?: number; goalsAgainst?: number }) => (s.totalGoals || 0) - (s.goalsAgainst || 0);

/**
 * The landing page is the Kage temple document (public/landing-pages/dfpl.html)
 * running in a full-screen, same-origin iframe. React owns the data: it writes
 * live values into the document's [data-dfpl] slots and turns its links into
 * client-side navigations.
 */
export default function Home() {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [doc, setDoc] = useState<Document | null>(null);
  const { currentSeason, loading: seasonLoading, managementImages } = useSeason();
  const { positions, members } = useAbout();
  const { teams, players, matches, loading: dataLoading, logAction } = useData();

  const handleDownloadExcel = () => {
    if (!currentSeason || !teams) return;
    const seasonNum = currentSeason.name.split(' ')[1] || currentSeason.id.replace('season-', '');
    const filename = `dfpl_S${seasonNum}.xlsx`;

    const standings = teams.map(team => {
      const stats = team.stats;
      return {
        Rank: 0,
        Team: team.name,
        Group: team.group || 'N/A',
        MP: stats.matchesPlayed || 0,
        W: stats.matchesWon || 0,
        D: stats.matchesDrawn || 0,
        L: stats.matchesLost || 0,
        GF: stats.totalGoals || 0,
        GA: stats.goalsAgainst || 0,
        GD: (stats.totalGoals || 0) - (stats.goalsAgainst || 0),
        Pts: (stats.matchesWon || 0) * 3 + (stats.matchesDrawn || 0),
      };
    }).sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.Team.localeCompare(b.Team));
    standings.forEach((s, i) => s.Rank = i + 1);

    const teamStats = teams.map(team => ({
      'Team Name': team.name,
      'Owner': team.owner,
      'Group': team.group || 'N/A',
      'Matches Played': team.stats.matchesPlayed || 0,
      'Won': team.stats.matchesWon || 0,
      'Drawn': team.stats.matchesDrawn || 0,
      'Lost': team.stats.matchesLost || 0,
      'Goals Scored': team.stats.totalGoals || 0,
      'Goals Against': team.stats.goalsAgainst || 0,
      'Total Assists': team.stats.totalAssists || 0,
      'Yellow Cards': team.stats.totalYellowCards || 0,
      'Red Cards': team.stats.totalRedCards || 0,
    }));

    const playersData = players.map(p => {
      const team = teams.find(t => t.id === p.teamId);
      return {
        'Name': p.name,
        'Team': team?.name || 'Unassigned',
        'Category': p.category,
        'Age': p.age || 'N/A',
        'Position': p.preferredPosition?.join(', ') || 'N/A',
        'Matches Played': p.matchesPlayed || 0,
        'Goals': p.goals || 0,
        'Assists': p.assists || 0,
        'Yellow Cards': p.yellowCards || 0,
        'Red Cards': p.redCards || 0,
      };
    });

    const activeStageKeys = ([
      currentSeason.matchConfig?.showGroupStage ? 'GROUP_STAGE' : null,
      (currentSeason.matchConfig?.showQuarterFinals && teams.length >= 16) ? 'QUARTER_FINALS' : null,
      'SEMI_FINALS',
      'FINALS',
      currentSeason.matchConfig?.showOthers ? 'OTHERS' : null
    ].filter(Boolean) as string[]);

    const matchesData = matches
      .filter(m => m.stage && activeStageKeys.includes(m.stage))
      .map(m => {
        const hTeam = teams.find(t => t.id === m.homeTeamId);
        const aTeam = teams.find(t => t.id === m.awayTeamId);
        return {
          'Date': m.date instanceof Date ? m.date.toLocaleDateString() : new Date(m.date).toLocaleDateString(),
          'Time': m.time,
          'Stage': m.stage,
          'Home Team': hTeam?.name || 'Unknown',
          'Away Team': aTeam?.name || 'Unknown',
          'Home Score': m.homeScore ?? 0,
          'Away Score': m.awayScore ?? 0,
          'Status': m.status,
          'Venue': m.venue || 'TBD',
        };
      });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(standings), "Standings");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamStats), "Team Stats");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(playersData), "Players");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matchesData), "Matches");
    XLSX.writeFile(wb, filename);
    logAction("DOWNLOAD_DATA", "Downloaded complete season registry to Excel.");
  };

  // Keep the latest handler reachable from the iframe listener without re-binding it.
  const downloadRef = useRef(handleDownloadExcel);
  downloadRef.current = seasonLoading || dataLoading || !currentSeason ? () => {} : handleDownloadExcel;

  const onLoad = useCallback(() => {
    const d = frameRef.current?.contentDocument;
    if (!d) return;
    setDoc(d);
    if (d.documentElement.dataset.dfplBound) return;
    d.documentElement.dataset.dfplBound = '1';
    d.addEventListener('click', (e) => {
      const el = (e.target as Element).closest?.('a[href^="/"], [data-dfpl-action="download"]');
      if (!el) return;
      e.preventDefault();
      if (el.matches('[data-dfpl-action="download"]')) downloadRef.current();
      else router.push(el.getAttribute('href')!);
    });
  }, [router]);

  // the iframe can finish loading before hydration attaches onLoad
  useEffect(() => {
    if (frameRef.current?.contentDocument?.readyState === 'complete' &&
        frameRef.current.contentWindow?.location.pathname.endsWith('dfpl.html')) onLoad();
  }, [onLoad]);

  useEffect(() => {
    if (!doc) return;
    const set = (key: string, value: string) =>
      doc.querySelectorAll(`[data-dfpl="${key}"]`).forEach((el) => { el.textContent = value; });
    const teamName = (id: string) => teams.find((t) => t.id === id)?.name ?? 'TBD';

    if (currentSeason) {
      set('season', `${currentSeason.name} — ${currentSeason.year}`);
    }
    set('year', String(new Date().getFullYear()));

    if (!dataLoading) {
      const finished = matches.filter((m) => m.status === 'FINISHED');
      set('stat-teams', String(teams.length).padStart(2, '0'));
      set('stat-players', String(players.length).padStart(2, '0'));
      set('stat-matches', String(finished.length).padStart(2, '0'));
      set('stat-goals', String(teams.reduce((n, t) => n + (t.stats.totalGoals || 0), 0)).padStart(2, '0'));

      const live = matches.find((m) => m.status === 'LIVE');
      const last = [...finished].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
      const shown = live ?? last;
      set('latest', shown
        ? `${teamName(shown.homeTeamId)} ${shown.homeScore ?? 0}–${shown.awayScore ?? 0} ${teamName(shown.awayTeamId)}`
        : 'Match centre');

      const table = [...teams].sort((a, b) =>
        points(b.stats) - points(a.stats) || goalDiff(b.stats) - goalDiff(a.stats) ||
        (b.stats.totalGoals || 0) - (a.stats.totalGoals || 0) || a.name.localeCompare(b.name));
      doc.querySelectorAll<HTMLAnchorElement>('[data-dfpl-row]').forEach((row, i) => {
        const t = table[i];
        row.hidden = !t && table.length > 0;
        if (!t) return;
        const f = (k: string) => row.querySelector(`[data-f="${k}"]`)!;
        const gd = goalDiff(t.stats);
        f('name').textContent = t.name;
        f('pts').textContent = `${points(t.stats)} PTS`;
        f('rec').textContent = `W ${t.stats.matchesWon || 0} · D ${t.stats.matchesDrawn || 0} · L ${t.stats.matchesLost || 0} · GD ${gd > 0 ? '+' : ''}${gd}`;
        f('mp').textContent = `${t.stats.matchesPlayed || 0} MP`;
        row.setAttribute('href', `/teams/${t.id}`);
      });
    }
    // section heights may have changed; the document re-measures its scroll anchors on resize
    doc.defaultView?.dispatchEvent(new Event('resize'));
  }, [doc, currentSeason, teams, players, matches, dataLoading]);

  // Chapter 04 — the committee: management photos crossfade in the frame, roles list beneath the copy.
  useEffect(() => {
    if (!doc) return;
    const frame = doc.querySelector('[data-dfpl-slides]');
    const roles = doc.querySelector('[data-dfpl-roles]');
    if (!frame || !roles) return;

    const urls = managementImages?.length ? managementImages : [STADIUM_FALLBACK];
    frame.querySelectorAll('img').forEach((img) => img.remove());
    const imgs = urls.map((src, i) => {
      const img = doc.createElement('img');
      img.src = src;
      img.alt = '';
      img.decoding = 'async';
      if (i === 0) img.className = 'on';
      frame.prepend(img);
      return img;
    });
    const count = doc.querySelector('[data-dfpl="slide-count"]');
    if (count) count.textContent = imgs.length > 1 ? `01 / ${String(imgs.length).padStart(2, '0')}` : '';

    roles.replaceChildren(...positions.flatMap((pos) => {
      const names = members.filter((m) => m.positionId === pos.id).map((m) => m.name);
      if (!names.length) return [];
      const li = doc.createElement('li');
      const role = doc.createElement('span');
      const who = doc.createElement('b');
      role.textContent = pos.title;
      who.textContent = names.join(', ');
      li.append(role, who);
      return [li];
    }));
    doc.defaultView?.dispatchEvent(new Event('resize'));

    if (imgs.length < 2) return;
    let i = 0;
    const id = setInterval(() => {
      imgs[i].classList.remove('on');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('on');
      if (count) count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(imgs.length).padStart(2, '0')}`;
    }, 5000);
    return () => clearInterval(id);
  }, [doc, managementImages, positions, members]);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background">
      <iframe
        ref={frameRef}
        src="/landing-pages/dfpl.html"
        title="Dongre Football Premier League"
        onLoad={onLoad}
        className="block min-h-0 w-full flex-1 border-0"
      />
      <AnnouncementBanner />
    </div>
  );
}
