// src/components/admin-sign-in.tsx
"use client";

import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error on new submission

    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On successful sign-in, AuthProvider will detect the state change.
      // We can then redirect the user to the admin dashboard.
      router.push('/admin');
    } catch (error: any) {
      // Provide user-friendly error messages
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No user found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-credential':
            setError('Invalid credentials. Please check your email and password.');
            break;
        default:
          setError('An unexpected error occurred. Please try again.');
          console.error(error);
          break;
      }
    }
  };

  return (
    <div className='space-y-4'>
      <form onSubmit={handleSignIn} className='space-y-4'>
        <div className='space-y-2'>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='border border-gray-300 rounded-md px-3 py-2 w-full'
            placeholder='Enter your email'
          />
        </div>
        <div className='space-y-2'>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='border border-gray-300 rounded-md px-3 py-2 w-full'
            placeholder='Enter your password'
          />
        </div>
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        <button type='submit'
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
