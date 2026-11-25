"use client";

import { useEffect, useRef, type VideoHTMLAttributes } from "react";
import { cn } from "@/utils/common";

export default function AppBannerVideo(
  props: VideoHTMLAttributes<HTMLVideoElement>,
) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      const video = videoRef.current;
      if (!video) return;
      if (mediaQuery.matches) {
        video.pause();
      } else if (props.autoPlay !== false) {
        void video.play().catch(() => {});
      }
    };

    syncPlayback();
    mediaQuery.addEventListener("change", syncPlayback);
    return () => mediaQuery.removeEventListener("change", syncPlayback);
  }, [props.autoPlay]);

  return (
    <video
      ref={videoRef}
      className={cn("h-full w-full object-cover", props.className)}
      autoPlay
      loop
      muted
      playsInline
      {...props}
    />
  );
}
