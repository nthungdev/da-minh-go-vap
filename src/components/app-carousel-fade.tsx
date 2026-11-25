"use client";

import { useTranslations } from "next-intl";
import type { HTMLAttributes, ReactNode } from "react";
import { CarouselPlaybackButton } from "@/components/app-carousel";
import { useCarousel } from "@/hooks/use-carousel";
import { cn } from "@/utils/common";

interface AppCarouselFadeProps<T> extends HTMLAttributes<HTMLElement> {
  id: string;
  items: T[];
  durations: number[];
  render: (item: T, index: number) => ReactNode;
  onTransition?: (index: number) => void;
}

function getCarouselItemKey<T>(item: T, index: number): string | number {
  if (item && typeof item === "object" && "id" in item) {
    const id = (item as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") {
      return id;
    }
  }
  return `slide-${index}`;
}

export default function AppCarouselFade<T>({
  id,
  className,
  durations,
  items,
  onTransition,
  render,
  ...props
}: AppCarouselFadeProps<T>) {
  const t = useTranslations("common");
  const {
    currentIndex,
    next,
    prev,
    getContainerProps,
    isUserPaused,
    toggleUserPause,
  } = useCarousel({
    count: items.length,
    durations,
    onTransition,
  });

  return (
    <div
      {...props}
      {...getContainerProps<HTMLDivElement>(props)}
      id={id}
      className={cn(
        "relative aspect-[4/1.2] w-full overflow-hidden",
        className,
      )}
    >
      <ul className="relative size-full">
        {items.map((item, index) => (
          <li
            key={getCarouselItemKey(item, index)}
            inert={currentIndex !== index}
            className={cn(
              "absolute top-0 left-0 size-full transition-opacity duration-[2s] ease-in-out motion-reduce:transition-none",
              currentIndex === index
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
          >
            {render(item, index)}
          </li>
        ))}
      </ul>

      {items.length <= 1 ? null : (
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
