"use client";

import Image from "next/image";
import AppCarousel from "@/components/app-carousel";
import { twMerge } from "tailwind-merge";
import { Media } from "@/payload-types";

interface ImageSlideshowProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  slides: Media[];
}

export default function ImageSlideshow({
  id,
  slides,
  className,
  ...props
}: ImageSlideshowProps) {
  const durations = slides.map(() => 5000); // 5 seconds for each slide

  return (
    <AppCarousel
      id={id}
      durations={durations}
      className={twMerge("aspect-2/3 w-full overflow-hidden", className)}
      {...props}
    >
      {slides
        .filter((slide) => typeof slide.url === "string")
        .map((slide, index) => (
          <div key={index} className="hs-carousel-slide">
            <Image
              className="h-full w-full object-cover"
              src={slide.url!}
              alt={slide.alt}
              sizes="100%"
              width={0}
              height={0}
            />
          </div>
        ))}
    </AppCarousel>
  );
}
