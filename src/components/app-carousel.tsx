"use client";

import { Children, HTMLAttributes, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

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
  const childrenCount = Children.count(children);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleMoveButton(direction: "previous" | "next") {
    resetTimeout();
    const newIndex =
      direction === "previous"
        ? (currentIndex - 1 + durations.length) % durations.length
        : (currentIndex + 1) % durations.length;
    setCurrentIndex(newIndex);
    onTransition?.(newIndex);
  }

  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  useEffect(() => {
    resetTimeout();

    const _currentIndex = currentIndex;
    timeoutRef.current = setTimeout(async () => {
      const newIndex = (currentIndex + 1) % durations.length;
      const carouselElement = document.querySelector<HTMLElement>(`#${id}`);
      if (!carouselElement) {
        console.warn("Carousel element not found");
        return;
      }
      const { HSCarousel } = await import("preline/preline");
      const carousel = new HSCarousel(carouselElement, {
        currentIndex: currentIndex,
      });
      carousel.goTo(newIndex);
      setCurrentIndex(newIndex);
      onTransition?.(newIndex);
    }, durations[_currentIndex]);

    return () => resetTimeout();
  }, [currentIndex, durations, id, onTransition]);

  return (
    <div
      id={id}
      data-hs-carousel={JSON.stringify({
        loadingClasses: "opacity-0",
        dotsItemClasses:
          "hs-carousel-active:bg-white hs-carousel-active:border-white size-3 border border-gray-400 rounded-full cursor-pointer dark:border-white dark:hs-carousel-active:bg-white dark:hs-carousel-active:border-white",
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
            className="hs-carousel-prev hs-carousel-disabled:opacity-50 group absolute inset-y-0 start-0 inline-flex h-full w-11.5 items-center justify-center text-gray-800 hover:bg-gray-800/10 focus:bg-gray-800/10 focus:outline-hidden disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
            onClick={() => handleMoveButton("previous")}
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
            <span className="sr-only">Previous</span>
          </button>
          <button
            type="button"
            className="hs-carousel-next hs-carousel-disabled:opacity-50 hover:text-whit group absolute inset-y-0 end-0 inline-flex h-full w-11.5 items-center justify-center text-gray-800 hover:bg-gray-800/10 focus:bg-gray-800/10 focus:outline-hidden disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
            onClick={() => handleMoveButton("next")}
          >
            <span className="sr-only">Next</span>
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
