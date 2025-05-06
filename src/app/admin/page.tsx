'use client';
import { ShieldCheck, ShieldAlert } from 'lucide-react'; // Added ShieldAlert
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// This is a placeholder for the actual admin dashboard.
// In a real application, you would add a check here to ensure the user is authenticated as an admin.
// For example, using Firebase Auth state and custom claims or checking a role in Firestore.

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Placeholder for auth check

  useEffect(() => {
    const checkAuth = async () => {
      // Simulate an auth check. Replace with actual Firebase auth check.
      // Example:
      // const firebase = (window as any).firebase;
      // if (firebase) {
      //   const auth = firebase.auth();
      //   auth.onAuthStateChanged(async (user) => {
      //     if (user) {
      //       // User is signed in, now check their role (e.g., from Firestore or custom claims)
      //       // const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
      //       // if (userDoc.exists && userDoc.data()?.role === 'admin') {
      //       //   setIsAdmin(true);
      //       // } else {
      //       //   setIsAdmin(false);
      //       //   // Optional: redirect to login if not admin
      //       //   // window.location.href = '/admin-auth'; 
      //       // }
      //       setIsAdmin(true); // For now, assume admin if logged in.
      //     } else {
      //       // No user signed in.
      //       setIsAdmin(false);
      //       window.location.href = '/admin-auth'; // Redirect to admin login
      //     }
      //     setIsLoading(false);
      //   });
      // } else {
      //   // Firebase not loaded yet
      //   setTimeout(checkAuth, 100); // Retry after a short delay
      // }
      
      // Simplified check for demonstration
      const firebase = (window as any).firebase;
      if (firebase && firebase.auth().currentUser) {
         // In a real app, you'd verify the role here. For now, if logged in, assume admin.
        setIsAdmin(true);
      } else if (firebase) { // Firebase loaded, but no user
        window.location.href = '/admin-auth';
      }
      // Keep retrying if firebase is not loaded yet
      if(!firebase) setTimeout(checkAuth, 200); else setIsLoading(false);


    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-lg text-muted-foreground">You do not have permission to view this page.</p>
        <Button asChild>
          <Link href="/admin-auth">Go to Admin Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="py-12">
        <h1 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          Admin Dashboard
        </h1>
        <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow">
          <p className="text-lg text-center">
            Welcome, Admin! This is where you can manage the tournament.
          </p>
          {/* Add admin-specific components and functionality here */}
          {/* For example: */}
          {/* - Forms to add/edit teams, matches, players */}
          {/* - Tables displaying data with edit/delete buttons */}
          {/* - User management (if applicable) */}
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => {
              const firebase = (window as any).firebase;
              if (firebase) {
                firebase.auth().signOut().then(() => {
                  window.location.href = '/';
                });
              }
            }}>
              Sign Out
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
