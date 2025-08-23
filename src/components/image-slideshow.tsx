"use client";

import Image from "next/image";
import AppCarousel from "@/components/app-carousel";
import { twMerge } from "tailwind-merge";
import { Media } from "@/payload-types";

export default function ImageSlideshow({
  slides,
  className,
}: {
  slides: Media[];
  className?: string;
}) {
  return (
    <div className={twMerge("aspect-2/3 w-full overflow-hidden", className)}>
      <AppCarousel>
        {slides
          .filter((slide) => typeof slide.url === "string")
          .map((slide, index) => (
            <Image
              key={index}
              className="h-full w-full object-cover"
              src={slide.url as string}
              alt={slide.alt || ""}
              sizes="100%"
              width={0}
              height={0}
            />
          ))}
      </AppCarousel>
    </div>
  );
}
