import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a standard sans-serif font
import './globals.css';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"

// Using Inter font as a default sans-serif. Geist might have issues in some setups.
// If Geist is required, ensure its setup matches Next.js recommendations exactly.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Using a standard variable name
});


export const metadata: Metadata = {
  title: 'Dongre Football Premier League',
  description: 'Track the Dongre Football Premier League - Teams, Matches, Players, and Stats.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Apply font variable to html tag, static classes directly to body
  return (
    <html lang="en" className={cn(inter.variable, 'h-full')} suppressHydrationWarning>
      <body
        className={cn(
          'antialiased min-h-screen flex flex-col font-sans' // Apply font-sans here
        )}
      >
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
