import type { Metadata } from 'next'
import './globals.css';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from 'react';
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Dongre Football Premier League',
  description: 'Track the Dongre Football Premier League - Teams, Matches, Players, and Stats.',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {

  // Firebase script loading - should ideally be in a client component with useEffect
  if (typeof window !== 'undefined') {
    const globalWindow = window as any;
    if (!globalWindow.firebaseLoaded) {
      const scriptApp = document.createElement('script');
      scriptApp.src = 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
      scriptApp.async = true;
      document.body.appendChild(scriptApp);
      const scriptAuth = document.createElement('script');
      scriptAuth.src = 'https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js';
      scriptAuth.async = true;
      document.body.appendChild(scriptAuth);
      scriptAuth.onload = () => {
        if (globalWindow.firebase) {
          const firebase = globalWindow.firebase;
          const auth = firebase.auth();
          globalWindow.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
            'recaptcha-container', {});
        }
      }
      globalWindow.firebaseLoaded = true;
    }
  }

  return (
    <html lang="en" className={cn(inter.variable, 'h-full')} suppressHydrationWarning>
      <body
        className={cn(
          'antialiased min-h-screen flex flex-col font-sans'
        )}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
