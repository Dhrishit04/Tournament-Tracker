import React, { useState } from 'react';

const AdminSignIn: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationCodeForm, setShowVerificationCodeForm] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);


  const handleSendCode = async (e:any) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && (window as any).firebase) {
      const firebase = (window as any).firebase;
      const auth = firebase.auth();
      const appVerifier = window.recaptchaVerifier;

      try {
        const confirmationResult = await firebase.auth().signInWithPhoneNumber(
          phoneNumber,
          appVerifier
        );
        setConfirmationResult(confirmationResult);
        setShowVerificationCodeForm(true);
      } catch (error) {
        console.error('Error sending verification code:', error);
      }
    }
  };

  const handleVerifyCode = async (e:any) => {
    e.preventDefault();
    try {
      await confirmationResult.confirm(verificationCode);
      // User signed in successfully.
      window.location.href = '/admin'; // Redirect to the admin page
    } catch (error) {
      console.error('Error verifying code:', error);
    }
  };

  return (
    <div className='space-y-4'>
      <div id="recaptcha-container"></div>

      {!showVerificationCodeForm ? (
        <form onSubmit={handleSendCode} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className='border border-gray-300 rounded-md px-3 py-2 w-full'
              placeholder='+1 123-456-7890'
            />
          </div>
          <button
            type="submit"
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Send Code
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor="verificationCode">Verification Code</label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              className='border border-gray-300 rounded-md px-3 py-2 w-full'
            />
          </div>
          <button
            type="submit"
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Verify Code
          </button>
        </form>
      )}
    </div>
  );
};
AdminSignIn.displayName = 'AdminSignIn'

export default AdminSignIn;
