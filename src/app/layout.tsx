import type { Metadata } from 'next'
import './globals.css';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Script from 'next/script'; // Import Script from next/script
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
        {/* Load Firebase SDKs from CDN */}
        <Script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js" strategy="beforeInteractive" />
        <Script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js" strategy="beforeInteractive" />
        {/* Initialize Firebase after SDKs are loaded */}
        <Script id="firebase-init" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined' && !window.firebaseAppInitialized) {
              const firebaseConfig = {
                apiKey: "YOUR_API_KEY", // Replace with your actual Firebase API Key
                authDomain: "YOUR_AUTH_DOMAIN", // Replace with your actual Firebase Auth Domain
                projectId: "YOUR_PROJECT_ID", // Replace with your actual Firebase Project ID
                storageBucket: "YOUR_STORAGE_BUCKET",
                messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
                appId: "YOUR_APP_ID"
              };
              if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
              }
              window.firebaseAppInitialized = true; // Prevent re-initialization
            }
          `}
        </Script>
      </body>
    </html>
  );
}
