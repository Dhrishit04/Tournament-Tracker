import type { Metadata } from 'next'
import './globals.css';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import React from 'react';
export const metadata = {
  title: 'Dongre Football Premier League',
  description: 'Track the Dongre Football Premier League - Teams, Matches, Players, and Stats.',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('antialiased min-h-screen flex flex-col font-sans')} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        > <Header />
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
           <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
