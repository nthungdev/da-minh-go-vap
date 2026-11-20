"use client";

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
  const childrenCount = Children.count(children);
  const { currentIndex, next, prev, getContainerProps } = useCarousel({
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
          className="hs-carousel-body pointer-events-none absolute inset-0 flex flex-nowrap transition-transform duration-700 [&>.hs-carousel-slide]:size-full [&>.hs-carousel-slide]:shrink-0"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children}
        </div>
      </div>

      {childrenCount <= 1 ? null : (
        <>
          <button
            type="button"
            className="hs-carousel-prev hs-carousel-disabled:opacity-50 group absolute inset-y-0 start-0 inline-flex h-full w-11.5 items-center justify-center text-gray-800 hover:bg-gray-800/10 focus:bg-gray-800/10 focus:outline-hidden disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              prev();
            }}
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
            className="hs-carousel-next hs-carousel-disabled:opacity-50 hover:text-whit group absolute inset-y-0 end-0 inline-flex h-full w-11.5 items-center justify-center text-gray-800 hover:bg-gray-800/10 focus:bg-gray-800/10 focus:outline-hidden disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              next();
            }}
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
        </>
      )}

      <div className="hs-carousel-pagination absolute start-0 end-0 bottom-3 flex justify-center space-x-2"></div>
    </div>
  );
}
