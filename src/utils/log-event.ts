"use client";

import { analytics } from "@/utils/firebase";
import {
  logEvent as analyticsLogEvent,
  EventNameString,
} from "firebase/analytics";

// Add more event name as needed
export type EventName = EventNameString;

const notSupportedWarning = "Analytics is not supported in this environment.";

/**
 * Update Event to include more events as needed.
 *
 * If you're logging a recommended event by Google, make sure to follow their guidelines:
 * https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag
 *
 * No need to log page_view events, as they are automatically logged by the SDK.
 */
export function logEvent(
  eventName: EventName,
  eventParams?: Parameters<typeof analyticsLogEvent>[2],
) {
  if (!analytics) {
    console.warn(notSupportedWarning);
    return;
  }
  analyticsLogEvent(analytics, eventName as string, eventParams);
}
