// app/lib/firebase-admin.js
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  // Parse the service account key from the environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// This is our secure, server-side database instance
const adminDb = admin.firestore();

export { adminDb };