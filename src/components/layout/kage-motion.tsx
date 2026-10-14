'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { BrandMark } from './header';

/* The landing page is the Kage temple document, which runs its own cursor,
   leaf fall and preloader. These are the same motions, rebuilt light for the
   rest of the site. */

export function KagePreloader() {
  return (
    <div className="k-pre" role="status" aria-label="Loading">
      <BrandMark className="k-pre-mark" />
      <div className="k-pre-word">DFPL</div>
      {/* a ball rolls the touchline while the data loads */}
      <div className="k-pre-bar"><i /><b className="k-pre-ball" /></div>
      <div className="k-pre-meta">Preparing the pitch</div>
    </div>
  );
}

/* a full-size pitch (105 × 68 m, in decimetres) drawn in hairline behind the
   page: touchline, halfway line, centre circle, both boxes, arcs and corners */
export function PitchLines() {
  return (
    <div className="k-pitch" aria-hidden>
      <svg viewBox="0 0 1050 680" preserveAspectRatio="xMidYMax slice">
        <rect x="5" y="5" width="1040" height="670" />
        <path d="M525 5v670" />
        <circle cx="525" cy="340" r="91.5" />
        <circle cx="525" cy="340" r="2.5" fill="rgba(223,231,224,.12)" />
        <path d="M5 138.5h165v403H5M5 248.5h55v183H5M170 266.9a91.5 91.5 0 0 1 0 146.2" />
        <path d="M1045 138.5H880v403h165M1045 248.5h-55v183h55M880 266.9a91.5 91.5 0 0 0 0 146.2" />
        <circle cx="115" cy="340" r="2.5" fill="rgba(223,231,224,.12)" />
        <circle cx="935" cy="340" r="2.5" fill="rgba(223,231,224,.12)" />
        <path d="M5 15a10 10 0 0 0 10-10M1035 5a10 10 0 0 0 10 10M5 665a10 10 0 0 1 10 10M1045 665a10 10 0 0 0-10 10" />
      </svg>
    </div>
  );
}

/* template .cur-dot: a ring that trails the pointer and opens over anything clickable */
function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const dot = ref.current!;
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      dot.classList.add('live');
      dot.classList.toggle('act', !!(e.target as Element).closest?.('a, button, [role="button"], [role="tab"], tr.cursor-pointer, input, select, label'));
    };
    const leave = () => dot.classList.remove('live');
    const tick = () => {
      x += (tx - x) * .18; y += (ty - y) * .18;
      dot.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  return <div ref={ref} className="k-cursor" aria-hidden />;
}

/* the landing's 5-lobed maple leaf (texLeaf), drawn once and reused */
function leafSprite(color: string) {
  const S = 64, c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d')!;
  x.translate(S / 2, S * .92); x.scale(S / 2.2, -S / 2.2);
  x.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -.95 + 1.9 * (i / 4) + Math.PI / 2;
    const len = i === 2 ? .96 : i === 1 || i === 3 ? .82 : .6;
    x.moveTo(0, .02);
    x.lineTo(Math.cos(a - .17) * len * .55, Math.sin(a - .17) * len * .55);
    x.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    x.lineTo(Math.cos(a + .17) * len * .55, Math.sin(a + .17) * len * .55);
    x.closePath();
  }
  x.fillStyle = color; x.fill();
  x.lineWidth = .05; x.strokeStyle = color; x.stroke();
  return c;
}

function LeafFall() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = ref.current!, ctx = cv.getContext('2d')!;
    const sprites = ['#9c120d', '#c21a12', '#6e0b08'].map(leafSprite);
    let w = 0, h = 0, raf = 0, last = performance.now();
    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    // ponytail: fixed count, scale with viewport area if it ever looks sparse on big screens
    const leaves = Array.from({ length: w < 640 ? 10 : 20 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      fall: 18 + Math.random() * 30, sway: .4 + Math.random() * 1.2, ph: Math.random() * 6.28,
      amp: 14 + Math.random() * 30, spin: (Math.random() - .5) * 1.6, rot: Math.random() * 6.28,
      roll: Math.random() * 6.28, rollSp: .6 + Math.random() * 1.8, s: 9 + Math.random() * 11,
      img: sprites[Math.floor(Math.random() * sprites.length)],
    }));
    const frame = (now: number) => {
      const dt = Math.min(.05, (now - last) / 1000), t = now / 1000;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const l of leaves) {
        l.y += l.fall * dt; l.rot += l.spin * dt; l.roll += l.rollSp * dt;
        if (l.y > h + 30) { l.y = -30; l.x = Math.random() * w; }
        ctx.save();
        ctx.translate(l.x + Math.sin(t * l.sway + l.ph) * l.amp, l.y);
        ctx.rotate(l.rot);
        ctx.scale(Math.cos(l.roll), 1); // the edge-on flip of a tumbling leaf
        ctx.globalAlpha = .55;
        ctx.drawImage(l.img, -l.s / 2, -l.s / 2, l.s, l.s);
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className="k-leaves" aria-hidden />;
}

/* panels light their border where the pointer is (read by .k-card::before in kage-ui.css) */
function usePointerLight() {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const card = (e.target as Element).closest?.('.k-card') as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, []);
}

export function KageMotion() {
  usePointerLight();
  if (usePathname() === '/') return null;
  return <><LeafFall /><Cursor /></>;
}
