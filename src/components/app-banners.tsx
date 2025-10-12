"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { HTMLAttributes, useState } from "react";
import { Media } from "@/payload-types";
import AppCarouselFade from "@/components/app-carousel-fade";

const AppBannerVideo = dynamic(() => import("@/components/app-banner-video"), {
  ssr: false,
});

const CAROUSEL_ID = "app-banners-carousel";
const PHOTO_DURATION = 5000; // 5 seconds

const checkVideo = (url: string) => {
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
      render={(item, index) => (
        <div key={index} className="">
          {checkVideo(item.url!) ? (
            <AppBannerVideo
              className="h-full w-full object-cover"
              src={item.url!}
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
              className="h-full w-full object-cover"
              src={item.url!}
              alt={item.alt}
              sizes="100%"
              width={0}
              height={0}
            />
          )}
        </div>
      )}
    />
  );
}
