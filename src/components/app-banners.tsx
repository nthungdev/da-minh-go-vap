"use client";

import Image from "next/image";
import AppCarousel from "./app-carousel";
import dynamic from "next/dynamic";
import { HTMLAttributes, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Media } from "@/payload-types";

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
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const nextIndex = (bannerIndex + 1) % banners.length;
  const prevIndex = (bannerIndex - 1 + banners.length) % banners.length;
  const duration = videosDuration[bannerIndex] || PHOTO_DURATION;
  const gotAllVideosDuration =
    Object.keys(videosDuration).length ===
    banners.filter(
      (banner) => typeof banner.url === "string" && checkVideo(banner.url),
    ).length;

  const AppBannerVideo = dynamic(
    () => import("@/components/app-banner-video"),
    { ssr: false },
  );

  const handleLoadedMetadata =
    (index: number) => (event: React.SyntheticEvent<HTMLVideoElement>) => {
      setVideosDuration({
        ...videosDuration,
        [index]: event.currentTarget.duration * 1000,
      });
    };

  const goNext = () => {
    const nextButtonEl = document.querySelector(
      `#${CAROUSEL_ID} [aria-label="Next slide"]`,
    ) as HTMLButtonElement;
    console.log({ nextButtonEl });
    nextButtonEl.click();
  };

  const timeout = async () => {
    const timeoutFn = () => {
      // setBannerIndex(nextIndex)
      console.log("carousel next");
      setIsSliding(true);
      goNext();
    };
    console.log("set timeout");
    setTimeoutId(setTimeout(timeoutFn, duration));
  };

  // const handleSlideChange = (index: number) => {
  //   console.log('handleSlideChange', index)
  //   if (isSliding) {
  //     console.log('set sliding off')
  //     setIsSliding(false)
  //   } else {
  //     console.log('clearing timeout')
  //     if (timeoutId) clearTimeout(timeoutId)
  //     // setBannerIndex((new Date()).getTime())
  //   }
  // }

  // useEffect(() => {
  //   if (banners.length < 2 || !gotAllVideosDuration) return
  //   console.log('effect')
  //   timeout()
  // }, [gotAllVideosDuration, bannerIndex])

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
