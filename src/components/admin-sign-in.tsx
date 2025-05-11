import React, { useState } from 'react'

const AdminSignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showVerificationCodeForm, setShowVerificationCodeForm] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && (window as any).firebase) {
      const firebase = (window as any).firebase;
      const auth = firebase.auth();
      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        await userCredential.user.sendEmailVerification();
        setShowVerificationCodeForm(true); // Show verification message
      } catch (error) {
        setError((error as any).message); // Display error message
      }
    }
  };

  const handleSendVerificationEmail = async () => {
    if (typeof window !== 'undefined' && (window as any).firebase) {
      const firebase = (window as any).firebase;
      const user = firebase.auth().currentUser;
      if (user) {
        try {
          await user.sendEmailVerification();
        } catch (error) {
          setError((error as any).message);
        }
      }
    }
  };
  return (
    <div className='space-y-4'>
      {showVerificationCodeForm ? (
        <div className='text-center'>
          <p className='text-green-600'>
            A verification email has been sent to your email address. Please click the link in the email to verify your account and then sign in again.
          </p>
          <button
            onClick={handleSendVerificationEmail}
            className='mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Resend Verification Email
          </button>
        </div>
      ) : (
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
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Sign In
          </button>
        </form>
      )}
    </div>
  )
}

export default AdminSignIn
