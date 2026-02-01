// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

export const validateFirebaseConfig = () => {
  const missing: string[] = [];
  Object.entries(firebaseConfig).forEach(([k, v]) => {
    if (!v) missing.push(k);
  });
  return { missing, valid: missing.length === 0 };
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;

// Enable IndexedDB persistence so Firestore queues writes while offline
enableIndexedDbPersistence(db).catch((err) => {
  // Common cases: failed-precondition (multiple tabs) or unimplemented (browser unsupported)
  if ((err as any).code === 'failed-precondition') {
    console.warn('Firestore persistence failed: Multiple tabs open', err);
  } else if ((err as any).code === 'unimplemented') {
    console.warn('Firestore persistence is not available in this browser', err);
  } else {
    console.warn('Error enabling Firestore persistence', err);
  }
});
