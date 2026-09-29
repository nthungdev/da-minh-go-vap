"use client";

import { useEffect, useRef } from "react";
import { logEvent } from "@/utils/log-event";

interface PostViewTrackerProps {
  slug: string;
  title?: string;
}

/**
 * Tracks post views by sending standard GA4 / Firebase Analytics events
 * (`view_item` and `select_content`) when a user visits a post page.
 */
export default function PostViewTracker({ slug, title }: PostViewTrackerProps) {
  const lastTrackedSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastTrackedSlugRef.current === slug) return;
    lastTrackedSlugRef.current = slug;

    // Log standard GA4 view_item event for post views
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

    // Also log select_content event for content analytics
    logEvent("select_content", {
      content_type: "post",
      item_id: slug,
    });
  }, [slug, title]);

  return null;
}
