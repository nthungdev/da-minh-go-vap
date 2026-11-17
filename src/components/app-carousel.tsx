"use client";

import { Children, HTMLAttributes, useEffect, useRef, useState } from "react";
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
    if (durations.length <= 1) return;
    resetTimeout();

    const _currentIndex = currentIndex;
    timeoutRef.current = setTimeout(() => {
      const newIndex = (currentIndex + 1) % durations.length;
      setCurrentIndex(newIndex);
      onTransition?.(newIndex);
    }, durations[_currentIndex]);

    return () => resetTimeout();
  }, [currentIndex, durations, id, onTransition]);

  return (
    <div
      id={id}
      className={cn("relative aspect-[4/1.2] w-full", className)}
      {...props}
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
              handleMoveButton("previous");
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
            <span className="sr-only">Previous</span>
          </button>
          <button
            type="button"
            className="hs-carousel-next hs-carousel-disabled:opacity-50 hover:text-whit group absolute inset-y-0 end-0 inline-flex h-full w-11.5 items-center justify-center text-gray-800 hover:bg-gray-800/10 focus:bg-gray-800/10 focus:outline-hidden disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              handleMoveButton("next");
            }}
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
