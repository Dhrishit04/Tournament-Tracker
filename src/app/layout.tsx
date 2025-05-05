import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils'; // Import cn
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tournament Tracker Lite',
  description: 'A simple tournament tracker app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Combine static and dynamic classes using cn for better handling
  const bodyClassName = cn(
    geistSans.variable,
    geistMono.variable,
    'antialiased min-h-screen flex flex-col'
  );

  return (
    <html lang="en">
      <body
        className={bodyClassName}
      >
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
