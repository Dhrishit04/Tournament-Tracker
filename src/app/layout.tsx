import type { Metadata } from 'next'
import './globals.css';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Dongre Football Premier League',
  description: 'Track the Dongre Football Premier League - Teams, Matches, Players, and Stats.',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {

  if (typeof window !== 'undefined') {
    if (!window.firebaseLoaded) {
      const scriptApp = document.createElement('script');
      scriptApp.src = 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
      scriptApp.async = true;
      document.body.appendChild(scriptApp);
      const scriptAuth = document.createElement('script');
      scriptAuth.src = 'https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js';
      scriptAuth.async = true;
      document.body.appendChild(scriptAuth);
      scriptAuth.onload = () => {
        if ((window as any).firebase) {
          const firebase = (window as any).firebase;
          const auth = firebase.auth();
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
            'recaptcha-container', {});
        }
      }
      window.firebaseLoaded = true;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'antialiased min-h-screen flex flex-col'
        )}
        suppressHydrationWarning={true}
      >
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
