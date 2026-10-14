
import type { Metadata } from 'next';
import './globals.css';
import './kage-ui.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AuthProvider } from '@/components/providers/auth-provider';
import { DataProvider } from '@/contexts/data-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SeasonProvider } from '@/contexts/season-context';
import { SessionGuard } from '@/components/layout/session-guard';
import { SmoothScrolling } from '@/components/providers/smooth-scrolling';
import { AboutProvider } from '@/contexts/about-context';
import { FootfallTracker } from '@/components/layout/footfall-tracker';
import { KageMotion, PitchLines } from '@/components/layout/kage-motion';

export const metadata: Metadata = {
  title: 'Tournament Tracker | Dongre Football Premier League',
  description: 'Live standings, fixtures, teams, and player statistics for the Dongre Football Premier League.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600&family=Barlow+Condensed:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="k-ui font-body antialiased">
        <SmoothScrolling>
            <ThemeProvider
              attribute="class"
              forcedTheme="dark"
              disableTransitionOnChange
            >
              <FirebaseClientProvider>
                <AuthProvider>
                  <SeasonProvider>
                    <DataProvider>
                      <AboutProvider>
                      <SessionGuard>
                        <div className="k-backdrop" aria-hidden />
                        <PitchLines />
                        <div className="flex min-h-screen flex-col">
                          <Header />
                          <main className="flex-grow">{children}</main>
                          <Footer />
                        </div>
                        <div className="k-vignette" aria-hidden />
                        <div className="noise-overlay" aria-hidden />
                        <FootfallTracker />
                        <KageMotion />
                      </SessionGuard>
                      </AboutProvider>
                      <Toaster />
                    </DataProvider>
                  </SeasonProvider>
                </AuthProvider>
              </FirebaseClientProvider>
            </ThemeProvider>
        </SmoothScrolling>
      </body>
    </html>
  );
}
