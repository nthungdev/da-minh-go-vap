"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { type HTMLAttributes, useState } from "react";
import AppCarouselFade from "@/components/app-carousel-fade";
import type { Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";

const AppBannerVideo = dynamic(() => import("@/components/app-banner-video"), {
  ssr: false,
});

const CAROUSEL_ID = "app-banners-carousel";
const PHOTO_DURATION = 8000; // 8 seconds

const isVideoUrl = (url: string) => {
  const videoExtensions = [".mp4", ".webm", ".ogg"];
  return videoExtensions.some((ext) => url.includes(ext));
};

interface AppBannersProps extends HTMLAttributes<HTMLElement> {
  banners: Media[];
}

export default function AppBanners(props: AppBannersProps) {
  const { banners, className } = props;

  const [durations, setDurations] = useState<number[]>(
    banners.map(() => PHOTO_DURATION),
  );

  const handleLoadedMetadata =
    (index: number) => (event: React.SyntheticEvent<HTMLVideoElement>) => {
      setDurations([
        ...durations.slice(0, index),
        event.currentTarget.duration * 1000,
        ...durations.slice(index + 1),
      ]);
    };

  return (
    <AppCarouselFade
      id={CAROUSEL_ID}
      durations={durations}
      className={className}
      items={banners}
      render={(item, index) => {
        const url = item.url;
        if (!url) return null;

        return (
          <div key={item.id} className="relative size-full">
            {isVideoUrl(url) ? (
              <AppBannerVideo
                className="size-full object-cover"
                src={url}
                autoPlay
                crossOrigin="anonymous"
                loop
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata(index)}
              />
            ) : (
              <Image
                unoptimized
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "low"}
                className="size-full object-cover"
                src={transformUrl(url, {
                  width: "1280",
                  quality: "80",
                })}
                alt={item.alt}
                sizes="100vw"
                fill
              />
            )}
          </div>
        );
      }}
    />
  );
}
