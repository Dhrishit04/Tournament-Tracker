const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { randomBytes } = require('crypto');

admin.initializeApp();
setGlobalOptions({ region: 'us-central1' });

const db = admin.firestore();
const auth = admin.auth();

/**
 * Callable Cloud Function for system admins to manage staff.
 * Caller must already hold the `role: 'system_admin'` custom claim.
 *
 * Actions:
 *   - create     { email, canAccessSettings? } -> { uid, passwordResetLink }
 *   - toggleSettings { uid, canAccessSettings } -> { uid, canAccessSettings }
 *   - delete     { uid } -> { uid }
 *   - rotatePassword { uid } -> { uid, passwordResetLink }
 */
exports.manageAdmin = onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'Must be signed in.');
  }

  const callerToken = request.auth.token;
  if (callerToken.role !== 'system_admin') {
    throw new HttpsError('permission-denied', 'Only the system admin can manage staff.');
  }

  const { action } = request.data || {};
  if (!action) {
    throw new HttpsError('invalid-argument', 'Missing `action`.');
  }

  switch (action) {
    case 'create': {
      const { email, canAccessSettings = false, displayName } = request.data;
      if (!email || typeof email !== 'string') {
        throw new HttpsError('invalid-argument', '`email` is required.');
      }
      const normalizedEmail = email.toLowerCase().trim();

      try {
        const tempPassword = randomBytes(24).toString('base64url');
        const userRecord = await auth.createUser({
          email: normalizedEmail,
          password: tempPassword,
          displayName: displayName || undefined,
        });

        await auth.setCustomUserClaims(userRecord.uid, {
          role: 'admin',
          canAccessSettings: !!canAccessSettings,
        });

        const link = await auth.generatePasswordResetLink(normalizedEmail);

        await db.collection('admins').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: normalizedEmail,
          displayName: displayName || null,
          canAccessSettings: !!canAccessSettings,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: callerUid,
        }, { merge: true });

        await db.collection('logs').add({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          adminEmail: request.auth.token.email || 'SYS_ADMIN',
          action: 'REGISTRY_ADD',
          details: `Authorized new staff: ${normalizedEmail}`,
        });

        return { uid: userRecord.uid, passwordResetLink: link };
      } catch (err) {
        if (err.code === 'auth/email-already-exists') {
          throw new HttpsError('already-exists', `An account for ${normalizedEmail} already exists.`);
        }
        throw new HttpsError('internal', err.message || 'Failed to create admin.');
      }
    }

    case 'toggleSettings': {
      const { uid, canAccessSettings } = request.data;
      if (!uid || typeof canAccessSettings !== 'boolean') {
        throw new HttpsError('invalid-argument', '`uid` and `canAccessSettings` are required.');
      }
      if (uid === callerUid) {
        throw new HttpsError('failed-precondition', 'Cannot change your own settings access.');
      }
      try {
        const target = await auth.getUser(uid);
        const existing = target.customClaims || {};
        if (existing.role !== 'admin') {
          throw new HttpsError('failed-precondition', 'Target user is not a regular admin.');
        }
        await auth.setCustomUserClaims(uid, { ...existing, canAccessSettings });
        await db.collection('admins').doc(uid).update({ canAccessSettings });
        await db.collection('logs').add({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          adminEmail: request.auth.token.email || 'SYS_ADMIN',
          action: 'PRIVILEGE_CHANGE',
          details: `${canAccessSettings ? 'Elevated' : 'Demoted'} staff uid=${uid} (Settings Access)`,
        });
        return { uid, canAccessSettings };
      } catch (err) {
        if (err instanceof HttpsError) throw err;
        throw new HttpsError('internal', err.message || 'Failed to toggle settings access.');
      }
    }

    case 'delete': {
      const { uid } = request.data;
      if (!uid) {
        throw new HttpsError('invalid-argument', '`uid` is required.');
      }
      if (uid === callerUid) {
        throw new HttpsError('failed-precondition', 'Cannot delete your own account.');
      }
      try {
        const target = await auth.getUser(uid);
        const existing = target.customClaims || {};
        if (existing.role === 'system_admin') {
          throw new HttpsError('failed-precondition', 'Cannot delete the system admin.');
        }
        await auth.deleteUser(uid);
        await db.collection('admins').doc(uid).delete();
        await db.collection('logs').add({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          adminEmail: request.auth.token.email || 'SYS_ADMIN',
          action: 'REGISTRY_REMOVE',
          details: `Revoked access for staff uid=${uid} (${target.email || 'unknown email'})`,
        });
        return { uid };
      } catch (err) {
        if (err instanceof HttpsError) throw err;
        throw new HttpsError('internal', err.message || 'Failed to delete admin.');
      }
    }

    case 'rotatePassword': {
      const { uid } = request.data;
      if (!uid) {
        throw new HttpsError('invalid-argument', '`uid` is required.');
      }
      try {
        const target = await auth.getUser(uid);
        if (!target.email) {
          throw new HttpsError('failed-precondition', 'Target user has no email.');
        }
        const link = await auth.generatePasswordResetLink(target.email);
        await db.collection('logs').add({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          adminEmail: request.auth.token.email || 'SYS_ADMIN',
          action: 'PASSWORD_RESET',
          details: `Issued password reset for staff uid=${uid} (${target.email})`,
        });
        return { uid, passwordResetLink: link };
      } catch (err) {
        if (err instanceof HttpsError) throw err;
        throw new HttpsError('internal', err.message || 'Failed to rotate password.');
      }
    }

    default:
      throw new HttpsError('invalid-argument', `Unknown action: ${action}`);
  }
});
