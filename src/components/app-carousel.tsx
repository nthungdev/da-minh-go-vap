"use client";

import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Children, type HTMLAttributes } from "react";
import { useCarousel } from "@/hooks/use-carousel";
import { cn } from "@/utils/common";

interface AppCarouselProps extends HTMLAttributes<HTMLElement> {
  id: string;
  durations: number[];
  onTransition?: (index: number) => void;
}

export default function AppCarousel({
  id,
  children,
  className,
  durations,
  onTransition,
  ...props
}: AppCarouselProps) {
  const t = useTranslations("common");
  const slides = Children.toArray(children);
  const childrenCount = slides.length;
  const {
    currentIndex,
    next,
    prev,
    getContainerProps,
    isUserPaused,
    toggleUserPause,
  } = useCarousel({
    count: childrenCount,
    durations,
    onTransition,
  });

  return (
    <div
      id={id}
      className={cn("relative aspect-[4/1.2] w-full", className)}
      {...props}
      {...getContainerProps<HTMLDivElement>(props)}
    >
      <div className="hs-carousel relative h-full w-full overflow-hidden bg-white">
        <div
          className="hs-carousel-body absolute inset-0 flex flex-nowrap transition-transform duration-700 motion-reduce:transition-none"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Children.map(slides, (slide, index) => (
            <div className="size-full shrink-0" inert={currentIndex !== index}>
              {slide}
            </div>
          ))}
        </div>
      </div>

      {childrenCount <= 1 ? null : (
        <>
          <button
            type="button"
            className="hs-carousel-prev group absolute inset-y-0 start-0 inline-flex h-full w-11.5 items-center justify-center text-gray-800 hover:bg-gray-800/10 focus:bg-gray-800/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none focus-visible:ring-inset disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10 hs-carousel-disabled:opacity-50"
            onClick={prev}
          >
            <span
              className="text-2xl group-hover:text-white"
              aria-hidden="true"
            >
              <svg
                className="size-5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </span>
            <span className="sr-only">{t("previous")}</span>
          </button>
          <button
            type="button"
            className="hs-carousel-next group absolute inset-y-0 end-0 inline-flex h-full w-11.5 items-center justify-center text-gray-800 hover:bg-gray-800/10 hover:text-white focus:bg-gray-800/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none focus-visible:ring-inset disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10 hs-carousel-disabled:opacity-50"
            onClick={next}
          >
            <span className="sr-only">{t("next")}</span>
            <span
              className="text-2xl group-hover:text-white"
              aria-hidden="true"
            >
              <svg
                className="size-5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </span>
          </button>
          <CarouselPlaybackButton
            className="absolute end-2 bottom-2"
            isUserPaused={isUserPaused}
            onToggle={toggleUserPause}
          />
        </>
      )}
    </div>
  );
}

export function CarouselPlaybackButton({
  className,
  isUserPaused,
  onToggle,
}: {
  className?: string;
  isUserPaused: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("common");
  const Icon = isUserPaused ? Play : Pause;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md bg-primary-950/90 text-white hover:bg-primary-950 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none focus-visible:ring-inset",
        className,
      )}
      aria-label={isUserPaused ? t("playSlideshow") : t("pauseSlideshow")}
      aria-pressed={isUserPaused}
      onClick={onToggle}
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}
