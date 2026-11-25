"use client";

import Image from "next/image";
import AppCarousel from "@/components/app-carousel";
import type { Media } from "@/payload-types";
import { transformUrl } from "@/utils/cloudflare";
import { cn } from "@/utils/common";

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
      className={cn(
        "aspect-2/3 w-full overflow-hidden rounded-xl border border-border bg-surface-muted shadow-sm",
        className,
      )}
      {...props}
    >
      {slides
        .filter(
          (slide): slide is Media & { url: string } =>
            typeof slide.url === "string",
        )
        .map((slide, index) => (
          <div key={slide.id} className="relative size-full shrink-0">
            <Image
              unoptimized
              className="object-cover"
              src={transformUrl(slide.url)}
              alt={slide.alt}
              fill
              loading={index === 0 ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, 20vw"
            />
          </div>
        ))}
    </AppCarousel>
  );
}
