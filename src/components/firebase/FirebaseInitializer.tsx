// src/components/firebase/FirebaseInitializer.tsx
"use client";

import { useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeQuDfuXPbnOwxO7ARnNTpBk09YBZpW70", 
  authDomain: "tournament-tracker-lite.firebaseapp.com", 
  projectId: "tournament-tracker-lite", 
  storageBucket: "tournament-tracker-lite.firebasestorage.app",
  messagingSenderId: "690015229898",
  appId: "1:690015229898:web:f8a293af78ff83930ae133"
};

export default function FirebaseInitializer() {
  useEffect(() => {
    // Initialize Firebase only once
    if (!getApps().length) {
      initializeApp(firebaseConfig);
      // You can also initialize other Firebase services here if needed, e.g., getFirestore(app)
    }
    // This ensures that `firebase` is available globally in case some legacy code relies on it,
    // but the modern approach is to import and use the modules directly.
    // @ts-ignore
    window.firebase = getApp(); 
    // @ts-ignore
    window.firebase.auth = getAuth(getApp());

  }, []);

  return null; // This component doesn't render any UI
}
