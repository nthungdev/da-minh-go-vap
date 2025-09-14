"use client";

import { Children, HTMLAttributes, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface AppCarouselProps extends HTMLAttributes<HTMLElement> {
  id: string;
  durations: number[];
}

export default function AppCarousel({
  id,
  children,
  className,
  durations,
  ...props
}: AppCarouselProps) {
  const childrenCount = Children.count(children);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(async () => {
      const newIndex =
        currentIndex === durations.length - 1 ? 0 : currentIndex + 1;
      setCurrentIndex(newIndex);
      const { HSCarousel } = await import("preline/preline");
      const carouselElement = document.querySelector<HTMLElement>(`#${id}`);
      if (!carouselElement) return;
      const carousel = new HSCarousel(carouselElement);
      carousel.goTo(newIndex);
    }, durations[currentIndex]);

    return () => resetTimeout();
  }, [currentIndex, durations, id]);

  return (
    <div
      id={id}
      data-hs-carousel={JSON.stringify({
        loadingClasses: "opacity-0",
        dotsItemClasses:
          "hs-carousel-active:bg-primary-700 hs-carousel-active:border-primary-700 size-3 border border-gray-400 rounded-full cursor-pointer dark:border-neutral-600 dark:hs-carousel-active:bg-primary-500 dark:hs-carousel-active:border-primary-500",
        isInfiniteLoop: true,
      })}
      className={twMerge("relative aspect-[4/1.2] w-full", className)}
      {...props}
    >
      <div className="hs-carousel relative h-full w-full overflow-hidden bg-white">
        <div className="hs-carousel-body absolute start-0 top-0 bottom-0 flex flex-nowrap opacity-0 transition-transform duration-700">
          {children}
        </div>
      </div>

      {childrenCount <= 1 ? null : (
        <>
          <button
            type="button"
            className="hs-carousel-prev hs-carousel-disabled:opacity-50 absolute inset-y-0 start-0 inline-flex h-full w-11.5 items-center justify-center text-gray-800 hover:bg-gray-800/10 focus:bg-gray-800/10 focus:outline-hidden disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
          >
            <span className="text-2xl" aria-hidden="true">
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
            <span className="sr-only">Previous</span>
          </button>
          <button
            type="button"
            className="hs-carousel-next hs-carousel-disabled:opacity-50 absolute inset-y-0 end-0 inline-flex h-full w-11.5 items-center justify-center text-gray-800 hover:bg-gray-800/10 focus:bg-gray-800/10 focus:outline-hidden disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
          >
            <span className="sr-only">Next</span>
            <span className="text-2xl" aria-hidden="true">
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
