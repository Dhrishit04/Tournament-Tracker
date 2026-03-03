"use client";

import React, { useRef, useState } from "react";
import {
    motion,
    useInView,
    useMotionValue,
    useSpring,
    useTransform,
    useScroll,
    HTMLMotionProps,
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
    duration = 0.8,
    className,
    ...props
}: FadeUpProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
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
    blurAmount?: string;
}

export function CinematicFade({
    children,
    delay = 0,
    duration = 1.2,
    blurAmount = "15px",
    className,
    ...props
}: CinematicFadeProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-15%" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 1.05, filter: `blur(${blurAmount})` }}
            animate={
                isInView
                    ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                    : { opacity: 0, scale: 1.05, filter: `blur(${blurAmount})` }
            }
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
    borderGlowColor = "rgba(139, 92, 246, 0.4)", // Default Accent
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
