import type { NextConfig } from 'next';

// App Hosting injects the web app config as FIREBASE_WEBAPP_CONFIG at build time.
// Use it when the NEXT_PUBLIC_* vars (local .env / apphosting.yaml) are missing.
const webApp = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || '{}');
const firebaseEnv = Object.fromEntries(
  Object.entries({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || webApp.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || webApp.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || webApp.projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || webApp.storageBucket,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || webApp.messagingSenderId,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || webApp.appId,
  }).filter(([, v]) => v)
) as Record<string, string>;

const nextConfig: NextConfig = {
  env: firebaseEnv,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
