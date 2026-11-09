"use-client";

import { FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export let analytics: Analytics | null = null;

export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") return null;
  if (analytics) return analytics;

  const measurementId = firebaseConfig.measurementId;
  if (!measurementId || measurementId.startsWith("G-0000")) {
    return null;
  }

  try {
    const { getAnalytics } = await import("firebase/analytics");
    analytics = getAnalytics(app);
    return analytics;
  } catch {
    return null;
  }
};
