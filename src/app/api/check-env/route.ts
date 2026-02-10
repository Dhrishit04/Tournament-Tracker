
import { NextResponse } from 'next/server';

export async function GET() {
  // This route reads the environment variables on the server and returns them.
  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY_IS_SET: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_IS_SET: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID_IS_SET: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_IS_SET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_IS_SET: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID_IS_SET: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return NextResponse.json(envVars);
}
