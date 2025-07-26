import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: 'crewzen',
      // IMPORTANT: Use the correct Firebase Storage bucket for this project!
      // crewzen.firebasestorage.app is the correct bucket, NOT crewzen.appspot.com
      storageBucket: 'crewzen.firebasestorage.app',
      credential: admin.credential.applicationDefault()
    });
    console.log('Firebase Admin SDK initialized with project ID: crewzen');
  } catch (e: any) {
    console.error('CRITICAL: Firebase Admin SDK initialization failed.', e.stack);
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { admin, auth, db };