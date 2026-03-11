'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

function ScrollToTop() {
    const lenis = useLenis();
    const pathname = usePathname();

    useEffect(() => {
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname, lenis]);

    return null;
}

export function SmoothScrolling({ children }: { children: ReactNode }) {
    return (
        <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
            <ScrollToTop />
            {children}
        </ReactLenis>
    );
}
