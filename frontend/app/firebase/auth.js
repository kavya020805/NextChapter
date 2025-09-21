"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider } from "./client";

export async function signupWithEmail(email, password) {
  const auth = getFirebaseAuth();
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function signinWithEmail(email, password) {
  const auth = getFirebaseAuth();
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function sendResetEmail(email, actionCodeSettings) {
  const auth = getFirebaseAuth();
  const settings =
    actionCodeSettings ||
    (typeof window !== "undefined"
      ? { url: window.location.origin + "/login", handleCodeInApp: false }
      : undefined);
  return await sendPasswordResetEmail(auth, email, settings);
}

export async function signInWithGooglePopup() {
  const auth = getFirebaseAuth();
  const provider = getGoogleProvider();
  return await signInWithPopup(auth, provider);
}

export async function setAuthPersistence(remember) {
  const auth = getFirebaseAuth();
  await setPersistence(
    auth,
    remember ? browserLocalPersistence : browserSessionPersistence
  );
}


