import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AuthProvider } from '@/components/providers/auth-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { DataProvider } from '@/contexts/data-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SeasonProvider } from '@/contexts/season-context';

export const metadata: Metadata = {
  title: 'Dongre Football Premier League',
  description: 'The official page for the Dongre Football Premier League tournament.',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <FirebaseClientProvider>
              <AuthProvider>
                <SeasonProvider>
                  <DataProvider>
                    <div className="flex min-h-screen flex-col">
                      <Header />
                      <main className="flex-grow">{children}</main>
                      <Footer />
                    </div>
                    <Toaster />
                  </DataProvider>
                </SeasonProvider>
              </AuthProvider>
            </FirebaseClientProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
