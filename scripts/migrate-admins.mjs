#!/usr/bin/env node
/**
 * One-time migration: convert every plaintext-password record in the
 * `/admins` Firestore collection into a real Firebase Auth user with
 * custom claims, and rewrite the metadata doc to the new shape.
 *
 * Idempotent: docs that already have a `uid` field pointing to an existing
 * Auth user are skipped.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=~/keys/dfpl-firebase-sa.json \
 *   node scripts/migrate-admins.mjs
 */
import { createRequire } from 'node:module';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { randomBytes } from 'node:crypto';

const require = createRequire(import.meta.url);

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.');
  process.exit(1);
}

let admin;
try {
  admin = require('firebase-admin');
} catch (err) {
  console.error('firebase-admin is not installed. Install it:');
  console.error('  mkdir -p .scripts && cd .scripts && npm init -y && npm i firebase-admin');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const auth = admin.auth();
const db = admin.firestore();
const SYSTEM_ADMIN_EMAIL = 'dfplowners@gmail.com';

async function processOne(docSnap, rl) {
  const data = docSnap.data() || {};
  const email = (data.email || '').toLowerCase().trim();
  if (!email) {
    console.warn(`Skipping ${docSnap.id}: no email.`);
    return { skipped: true };
  }
  if (email === SYSTEM_ADMIN_EMAIL) {
    console.log(`Skipping ${email}: this is the system admin (handled by manage-system-admin.mjs).`);
    return { skipped: true };
  }

  if (data.uid) {
    try {
      await auth.getUser(data.uid);
      console.log(`Skipping ${email}: already migrated to uid=${data.uid}.`);
      return { skipped: true };
    } catch (e) {
      // uid field present but no Auth user — treat as stale, fall through
      console.warn(`Doc ${docSnap.id} has stale uid=${data.uid}, re-migrating.`);
    }
  }

  const confirm = await rl.question(
    `\nMigrate ${email} (canAccessSettings=${!!data.canAccessSettings})? [y/N] `
  );
  if (confirm.trim().toLowerCase() !== 'y') {
    console.log('  skipped by user.');
    return { skipped: true };
  }

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`  Existing Auth user uid=${userRecord.uid} for ${email}.`);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err;
    const tempPw = randomBytes(24).toString('base64url');
    userRecord = await auth.createUser({ email, password: tempPw });
    console.log(`  Created Auth user uid=${userRecord.uid} with random temp password.`);
  }

  await auth.setCustomUserClaims(userRecord.uid, {
    role: 'admin',
    canAccessSettings: !!data.canAccessSettings,
  });
  console.log(`  Set claims: role=admin, canAccessSettings=${!!data.canAccessSettings}.`);

  let resetLink = null;
  try {
    resetLink = await auth.generatePasswordResetLink(email);
  } catch (e) {
    console.warn(`  Could not generate reset link (email provider may be unconfigured).`);
  }
  if (resetLink) {
    console.log(`  Password reset link: ${resetLink}`);
  }

  await db.collection('admins').doc(userRecord.uid).set(
    {
      uid: userRecord.uid,
      email,
      displayName: data.displayName || null,
      canAccessSettings: !!data.canAccessSettings,
      createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      migratedFrom: docSnap.id,
    },
    { merge: true }
  );

  if (docSnap.id !== userRecord.uid) {
    await db.collection('admins').doc(docSnap.id).delete();
    console.log(`  Old doc ${docSnap.id} deleted; new doc at /admins/${userRecord.uid}.`);
  } else {
    await db.collection('admins').doc(docSnap.id).update({
      uid: userRecord.uid,
      migratedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  In-place updated /admins/${docSnap.id}.`);
  }

  return { migrated: true, uid: userRecord.uid, resetLink };
}

async function main() {
  const rl = readline.createInterface({ input, output });
  console.log('Reading /admins collection...');
  const snap = await db.collection('admins').get();
  if (snap.empty) {
    console.log('No documents found. Nothing to migrate.');
    rl.close();
    process.exit(0);
  }
  console.log(`Found ${snap.size} document(s).`);

  const results = [];
  for (const docSnap of snap.docs) {
    try {
      const r = await processOne(docSnap, rl);
      results.push({ id: docSnap.id, ...r });
    } catch (err) {
      console.error(`Failed on ${docSnap.id}:`, err.message);
      results.push({ id: docSnap.id, error: err.message });
    }
  }

  console.log('\n=== Summary ===');
  for (const r of results) {
    console.log(JSON.stringify(r));
  }

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
