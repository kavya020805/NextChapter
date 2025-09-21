// Firebase web configuration (client-side)
// Uses environment variables for production security

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBh4dtb0Pt6sq_oYTUp8h6j9KXsFv-ClAI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nextchapter-11631.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nextchapter-11631",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nextchapter-11631.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "636715838735",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:636715838735:web:8782b15cebe7d001e6627a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RVF5BBYB1W",
};


