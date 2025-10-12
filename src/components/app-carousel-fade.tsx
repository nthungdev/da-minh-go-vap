"use client";

import {
  Children,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

interface AppCarouselFadeProps<T> extends HTMLAttributes<HTMLElement> {
  id: string;
  items: T[];
  durations: number[];
  render: (item: T, index: number) => ReactNode;
  onTransition?: (index: number) => void;
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
    timeoutRef.current = setTimeout(async () => {
      const newIndex = (currentIndex + 1) % durations.length;
      setCurrentIndex(newIndex);
      onTransition?.(newIndex);
    }, durations[_currentIndex]);

    return () => resetTimeout();
  }, [currentIndex, durations, id, onTransition]);

  return (
    <div
      id={id}
      className={twMerge(
        "relative aspect-[4/1.2] w-full overflow-hidden",
        className,
      )}
      {...props}
    >
      <ul className="relative size-full">
        {items.map((item, index) => (
          <li
            key={index}
            className={twMerge(
              "pointer-events-none absolute top-0 left-0 size-full opacity-0 transition-opacity duration-700 ease-in-out",
              currentIndex === index && "opacity-100",
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
