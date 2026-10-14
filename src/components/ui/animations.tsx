"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    motion,
    useInView,
    useMotionValue,
    useSpring,
    useTransform,
    useScroll,
    useReducedMotion,
    HTMLMotionProps,
    MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------
// 1. FadeUp (Smooth Fade-Up Entrance)
// ----------------------------------------------------------------------
interface FadeUpProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function FadeUp({
    children,
    delay = 0,
    duration = 1.05,
    className,
    ...props
}: FadeUpProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 26 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
            transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// 2. CinematicFade (Scale down + Blur to Focus)
// ----------------------------------------------------------------------
interface CinematicFadeProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
}

export function CinematicFade({
    children,
    delay = 0,
    duration = 1.05,
    className,
    ...props
}: CinematicFadeProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-15%" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 26 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
            transition={{
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1], // Custom cinematic easing
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// 3. TiltCard (Interactive 3D Hover Effect)
// ----------------------------------------------------------------------
interface TiltCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    borderGlowColor?: string;
}

export function TiltCard({
    children,
    className,
    borderGlowColor = "rgba(224,35,28, 0.4)", // Default Accent
    ...props
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth out the mouse values
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    // Map mouse position to rotation angle
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Get mouse position relative to card center, normalized to [-0.5, 0.5]
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn("relative group transition-all duration-300", className)}
            {...props}
        >
            {/* 3D Border Glow that reacts to hover */}
            <div
                className="absolute inset-0 -z-10 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-xl"
                style={{
                    backgroundColor: borderGlowColor,
                    transform: "translateZ(-20px)",
                }}
            />

            {/* Container to handle z-translation for the children */}
            <div className="h-full w-full" style={{ transform: "translateZ(30px)" }}>
                {children}
            </div>
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// 4. StaggeredGrid (For Tables, Roster Cards, Match Lists)
// ----------------------------------------------------------------------
interface StaggeredGridProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    staggerDelay?: number;
}

export function StaggeredGrid({
    children,
    className,
    staggerDelay = 0.05,
    ...props
}: StaggeredGridProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-5%" });

    // Add the stagger value to a custom CSS variable so children can read it,
    // or we can just rely on Framer Motion Variants if children are direct.
    // We'll use Framer Motion variants here.

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={className}
            {...props}
        >
            {/* In Framer Motion, if a child doesn't specify an initial/animate, 
          and isn't explicitly a motion component with variants matching the parent, 
          it won't magically inherit the stagger. 
          
          For this component to work flawlessly, the CHILDREN must be motion divs 
          with a standard 'hidden'/'visible' variant. E.g. gridItemVariants defined below.
      */}
            {children}
        </motion.div>
    );
}

// Helper variant for items used inside StaggeredGrid
export const gridItemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            damping: 20,
            stiffness: 100,
        },
    },
};

// ----------------------------------------------------------------------
// 5. ScrollRevealText (Joby Aviation Style Scroll-linked Word Opacity)
// ----------------------------------------------------------------------
interface ScrollRevealTextProps {
    text: string;
    className?: string;
}

export function ScrollRevealText({ text, className }: ScrollRevealTextProps) {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 85%", "end 40%"],
    });

    const words = text.split(" ");

    return (
        <p ref={containerRef} className={cn("flex flex-wrap gap-x-[0.25em]", className)}>
            {words.map((word, i) => {
                const start = i / words.length;
                const end = start + 1 / words.length;
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);
                return (
                    <motion.span key={i} style={{ opacity }} className="relative text-foreground">
                        {word}
                    </motion.span>
                );
            })}
        </p>
    );
}

// ----------------------------------------------------------------------
// 6. ParallaxExpand (Joby full-screen expanding container on scroll)
// ----------------------------------------------------------------------
interface ParallaxExpandProps {
    children: React.ReactNode;
    className?: string;
}

export function ParallaxExpand({ children, className }: ParallaxExpandProps) {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1, 0.5]);

    return (
        <div ref={containerRef} className={cn("w-full overflow-hidden relative", className)}>
            <motion.div style={{ scale, opacity }} className="w-full h-full">
                {children}
            </motion.div>
        </div>
    );
}

interface ScrollMotionProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    distance?: number;
}

export function ScrollMotion({ children, className, distance = 80, ...props }: ScrollMotionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

    return <motion.div ref={ref} style={{ y }} className={className} {...props}>{children}</motion.div>;
}

interface ScrollStoryStep {
    eyebrow: string;
    title: string;
    detail: string;
    value: string;
}

interface ScrollStoryProps {
    steps: ScrollStoryStep[];
    className?: string;
}

function StoryPanel({
    step,
    index,
    progress,
    total,
}: {
    step: ScrollStoryStep;
    index: number;
    progress: MotionValue<number>;
    total: number;
}) {
    const shouldReduceMotion = useReducedMotion();
    const start = index / total;
    const end = Math.min(1, (index + 1) / total);
    const fadeIn = index === 0 ? 0 : Math.max(0, (index - 0.45) / total);
    const fadeOut = index === total - 1 ? 1 : Math.min(1, (index + 1.45) / total);
    const activeStart = index === 0 ? 0.001 : start;
    const activeEnd = index === total - 1 ? 0.999 : end;
    const opacity = useTransform(
        progress,
        [fadeIn, activeStart, activeEnd, fadeOut],
        [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0],
        { clamp: true },
    );
    const y = useTransform(progress, [fadeIn, activeStart, activeEnd, fadeOut], [24, 0, 0, -18], { clamp: true });
    const scale = useTransform(progress, [fadeIn, activeStart, activeEnd, fadeOut], [0.98, 1, 1, 0.99], { clamp: true });

    return (
        <motion.article style={shouldReduceMotion ? undefined : { opacity, y, scale }} className={cn("flex flex-col justify-between p-7 sm:p-10", shouldReduceMotion ? "relative" : "absolute inset-0")}>
            <div className="flex items-start justify-between gap-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">{step.eyebrow}</p>
                <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            </div>
            <div>
                <p className="text-5xl font-semibold tracking-[-0.07em] text-foreground sm:text-7xl">{step.value}</p>
                <h3 className="mt-5 max-w-md text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{step.title}</h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">{step.detail}</p>
            </div>
        </motion.article>
    );
}

export function ScrollStory({ steps, className }: ScrollStoryProps) {
    const ref = useRef<HTMLElement>(null);
    const shouldReduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
    const introY = useTransform(scrollYProgress, [0, 1], [0, -90]);

    return (
        <section ref={ref} className={cn("relative border-y border-border bg-secondary/45", shouldReduceMotion ? "min-h-0" : "min-h-[220vh]", className)}>
            <div className={cn("flex min-h-screen items-center overflow-hidden px-5 py-20 sm:px-8 lg:py-24", !shouldReduceMotion && "sticky top-0")}>
                <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-24">
                    <motion.div style={shouldReduceMotion ? undefined : { y: introY }} className="max-w-xl">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Scroll the season</p>
                        <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-6xl">The competition, in motion.</h2>
                        <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">Move through the live record. Every stop brings a different part of the tournament into focus.</p>
                        <div className="mt-10 h-px w-full max-w-xs overflow-hidden bg-border">
                            <motion.div style={shouldReduceMotion ? { width: '100%' } : { width: progressWidth }} className="h-full origin-left bg-accent" />
                        </div>
                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Scroll to explore</p>
                    </motion.div>

                    <div className={cn("relative overflow-hidden border border-border bg-card shadow-[0_24px_80px_-48px_hsl(var(--foreground)/0.45)]", shouldReduceMotion ? "h-auto" : "h-[26rem] sm:h-[32rem]")}>
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--accent)/0.1),transparent_45%,hsl(var(--foreground)/0.04))]" />
                        {steps.map((step, index) => <StoryPanel key={`${step.eyebrow}-${index}`} step={step} index={index} progress={scrollYProgress} total={steps.length} />)}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function RollingLabel({ children }: { children: React.ReactNode }) {
    return (
        <motion.span
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
        >
            {children}
        </motion.span>
    );
}

// ----------------------------------------------------------------------
// 7. ScrollReveal (Scroll-triggered reveal with scale + opacity)
// ----------------------------------------------------------------------
interface ScrollRevealProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export function ScrollReveal({ children, delay = 0, className, ...props }: ScrollRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-15%" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.97 }}
            transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// 8. MarqueeStrip (Premium scrolling banner text)
// ----------------------------------------------------------------------
interface MarqueeStripProps {
    text: string;
    className?: string;
    speed?: number;
}

export function MarqueeStrip({ text, className, speed = 30 }: MarqueeStripProps) {
    const repeated = Array(4).fill(text).join("  ·  ");
    return (
        <div className={cn("overflow-hidden whitespace-nowrap bg-primary/5 border-y border-border py-4", className)}>
            <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: speed, ease: "linear", repeat: Infinity }}
                className="inline-flex gap-8"
            >
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">{repeated}</span>
            </motion.div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 9. ScrollProgressIndicator (Fixed thin line showing scroll position)
// ----------------------------------------------------------------------
export function ScrollProgressIndicator() {
    const { scrollYProgress } = useScroll();
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
    return (
        <motion.div
            style={{ scaleX }}
            className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 z-[60] origin-left shadow-[0_0_12px_rgba(245,158,11,0.35)]"
        />
    );
}

// ----------------------------------------------------------------------
// CountUp (figures run up from zero the first time they scroll into view)
// ----------------------------------------------------------------------
export function CountUp({ value, pad = false, className }: { value: number; pad?: boolean; className?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const seen = useInView(ref, { once: true });
    const reduce = useReducedMotion();
    const [shown, setShown] = useState(0);

    useEffect(() => {
        if (!seen) return;
        if (reduce) { setShown(value); return; }
        let raf = 0;
        const t0 = performance.now(), dur = 1400;
        const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            setShown(Math.round(value * (1 - Math.pow(1 - p, 4)))); // ease-out quart
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [seen, value, reduce]);

    return <span ref={ref} className={cn("tabular-nums", className)}>{pad ? String(shown).padStart(2, "0") : shown}</span>;
}
