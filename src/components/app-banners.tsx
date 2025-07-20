"use client";

import Image from "next/image";
import AppCarousel from "./app-carousel";
import dynamic from "next/dynamic";
import { HTMLAttributes, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Media } from "@/payload-types";

const AppBannerVideo = dynamic(() => import("@/components/app-banner-video"), {
  ssr: false,
});

const CAROUSEL_ID = "app-banners-carousel";
const PHOTO_DURATION = 5000; // 3 seconds

const checkVideo = (url: string) => {
  const videoExtensions = [".mp4", ".webm", ".ogg"];
  return videoExtensions.some((ext) => url.includes(ext));
};

interface AppBannersProps extends HTMLAttributes<HTMLElement> {
  banners: Media[];
}

export default function AppBanners(props: AppBannersProps) {
  const { banners, className } = props;

  const [videosDuration, setVideosDuration] = useState<Record<number, number>>(
    {},
  );

  const handleLoadedMetadata =
    (index: number) => (event: React.SyntheticEvent<HTMLVideoElement>) => {
      setVideosDuration({
        ...videosDuration,
        [index]: event.currentTarget.duration * 1000,
      });
    };

  return (
    <div className={twMerge("w-full aspect-[4/1.2]", className)}>
      <AppCarousel id={CAROUSEL_ID} slideInterval={PHOTO_DURATION}>
        {banners.map(
          (banner, index) =>
            typeof banner.url === "string" && (
              <div
                key={index}
                id={`${CAROUSEL_ID}-item-${index}`}
                className="h-full w-full"
              >
                {checkVideo(banner.url) ? (
                  <AppBannerVideo
                    id={`banner-video-${index}`}
                    className="object-cover h-full w-full"
                    src={banner.url}
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
                    className="object-cover h-full w-full"
                    src={banner.url}
                    alt={banner.alt || ""}
                    sizes="100%"
                    width={0}
                    height={0}
                  />
                )}
              </div>
            ),
        )}
      </AppCarousel>
    </div>
  );
}
