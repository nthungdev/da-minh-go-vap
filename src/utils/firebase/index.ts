"use client";

import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import type { Analytics } from "firebase/analytics";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Analytics runs only where explicitly enabled (production); staging and local dev skip Firebase entirely. */
export const analyticsEnabled =
  process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED === "true";

export let analytics: Analytics | null = null;

let app: FirebaseApp | null = null;

const getFirebaseApp = async (): Promise<FirebaseApp> => {
  if (app) return app;
  const { getApp, getApps, initializeApp } = await import("firebase/app");
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
};

export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined" || !analyticsEnabled) return null;
  if (analytics) return analytics;

  try {
    const { getAnalytics } = await import("firebase/analytics");
    analytics = getAnalytics(await getFirebaseApp());
    return analytics;
  } catch {
    return null;
  }
};
