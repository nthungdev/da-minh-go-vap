"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
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
      <div className="relative h-full w-full overflow-hidden bg-white">
        <div
          className="absolute inset-0 flex flex-nowrap transition-transform duration-700 motion-reduce:transition-none"
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
            aria-label={t("previous")}
            className="group absolute inset-y-0 start-0 inline-flex h-full w-11.5 cursor-pointer items-center justify-center text-gray-800 transition-colors duration-200 hover:bg-gray-800/15 focus:bg-gray-800/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset active:bg-gray-800/25 disabled:pointer-events-none motion-reduce:transition-none dark:text-white dark:hover:bg-white/15 dark:focus:bg-white/10 dark:active:bg-white/25"
            onClick={prev}
          >
            <span
              className="text-2xl transition-colors duration-200 group-hover:text-white motion-reduce:transition-none"
              aria-hidden="true"
            >
              <ChevronLeft className="size-5 shrink-0" />
            </span>
          </button>
          <button
            type="button"
            aria-label={t("next")}
            className="group absolute inset-y-0 end-0 inline-flex h-full w-11.5 cursor-pointer items-center justify-center text-gray-800 transition-colors duration-200 hover:bg-gray-800/15 hover:text-white focus:bg-gray-800/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset active:bg-gray-800/25 disabled:pointer-events-none motion-reduce:transition-none dark:text-white dark:hover:bg-white/15 dark:focus:bg-white/10 dark:active:bg-white/25"
            onClick={next}
          >
            <span
              className="text-2xl transition-colors duration-200 group-hover:text-white motion-reduce:transition-none"
              aria-hidden="true"
            >
              <ChevronRight className="size-5 shrink-0" />
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
        "inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md bg-primary-950/90 text-white transition-colors duration-200 hover:bg-primary-950 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:bg-primary-900 motion-reduce:transition-none",
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
