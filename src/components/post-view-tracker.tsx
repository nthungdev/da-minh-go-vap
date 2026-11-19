"use client";

import { useEffect, useRef } from "react";
import { logEvent } from "@/utils/log-event";

const DEDUP_WINDOW_MS = 1000;
let lastTrackedEvent: { slug: string; timestamp: number } | null = null;

interface PostViewTrackerProps {
  slug: string;
  title?: string;
}

/**
 * Tracks post views by sending a standard GA4 / Firebase Analytics `view_item`
 * event when a user visits a post page.
 */
export default function PostViewTracker({ slug, title }: PostViewTrackerProps) {
  const lastTrackedSlugRef = useRef<string | null>(null);

  useEffect(() => {
    const now = Date.now();
    if (lastTrackedSlugRef.current === slug) return;
    if (
      lastTrackedEvent &&
      lastTrackedEvent.slug === slug &&
      now - lastTrackedEvent.timestamp < DEDUP_WINDOW_MS
    ) {
      lastTrackedSlugRef.current = slug;
      return;
    }

    lastTrackedSlugRef.current = slug;
    lastTrackedEvent = { slug, timestamp: now };

    logEvent("view_item", {
      content_type: "post",
      item_id: slug,
      items: [
        {
          item_id: slug,
          item_name: title || slug,
        },
      ],
    });
  }, [slug, title]);

  return null;
}
