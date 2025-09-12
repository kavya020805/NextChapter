import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { firebaseConfig } from "./config";

let firebaseApp;
let auth;
let analytics;
let googleProvider;

export function getFirebaseApp() {
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

export function getFirebaseAuth() {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export async function getFirebaseAnalytics() {
  if (!analytics) {
    try {
      if (typeof window !== "undefined" && (await isSupported())) {
        analytics = getAnalytics(getFirebaseApp());
      }
    } catch (_) {
      // no-op: analytics not supported in this environment
    }
  }
  return analytics;
}

export function getGoogleProvider() {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  }
  return googleProvider;
}


