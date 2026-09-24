#!/usr/bin/env node
/**
 * One-time script: ensure the system admin Firebase Auth user exists and has
 * the `role: 'system_admin'` custom claim set. Run after deploying the new
 * rules and before running `migrate-admins.mjs`.
 *
 * Usage:
 *   1. Download a service account JSON from Firebase Console
 *      (Project Settings → Service Accounts → Generate new private key).
 *   2. Save it OUTSIDE the repo (e.g. ~/keys/dfpl-firebase-sa.json).
 *   3. Add its filename pattern to .gitignore.
 *   4. Run:
 *        GOOGLE_APPLICATION_CREDENTIALS=~/keys/dfpl-firebase-sa.json \
 *        node scripts/manage-system-admin.mjs
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const require = createRequire(import.meta.url);

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.');
  process.exit(1);
}

const SYSTEM_ADMIN_EMAIL = 'dfplowners@gmail.com';

let admin;
try {
  admin = require('firebase-admin');
} catch (err) {
  console.error('firebase-admin is not installed. Run `npm install --prefix . firebase-admin` or use a separate node_modules.');
  console.error('Or, simpler: install it into a temp dir:');
  console.error('  mkdir -p .scripts && cd .scripts && npm init -y && npm i firebase-admin');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const auth = admin.auth();

async function main() {
  const rl = readline.createInterface({ input, output });

  let user;
  try {
    user = await auth.getUserByEmail(SYSTEM_ADMIN_EMAIL);
    console.log(`Found existing Auth user for ${SYSTEM_ADMIN_EMAIL}: uid=${user.uid}`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log(`No Auth user exists yet for ${SYSTEM_ADMIN_EMAIL}.`);
      const tempPw = require('crypto').randomBytes(24).toString('base64url');
      user = await auth.createUser({ email: SYSTEM_ADMIN_EMAIL, password: tempPw });
      console.log(`Created Auth user uid=${user.uid} with random temp password.`);
      try {
        const link = await auth.generatePasswordResetLink(SYSTEM_ADMIN_EMAIL);
        console.log('\nPassword reset link (relay this to the system admin):');
        console.log(link);
      } catch (e) {
        console.warn('Could not generate reset link (email provider may be unconfigured). Set a password via the Firebase Console.');
      }
    } else {
      throw err;
    }
  }

  const existingClaims = user.customClaims || {};
  if (existingClaims.role === 'system_admin') {
    console.log(`User already has role=system_admin claim. No change.`);
  } else {
    const confirm = await rl.question(`Set role=system_admin claim on uid=${user.uid}? [y/N] `);
    if (confirm.trim().toLowerCase() !== 'y') {
      console.log('Aborted.');
      process.exit(0);
    }
    await auth.setCustomUserClaims(user.uid, { ...existingClaims, role: 'system_admin', canAccessSettings: true });
    console.log(`Claim set. uid=${user.uid} now has role=system_admin, canAccessSettings=true.`);
  }

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
