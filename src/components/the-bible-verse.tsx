"use client";

import { CarouselPlaybackButton } from "@/components/app-carousel";
import { useCarousel } from "@/hooks/use-carousel";
import { cn } from "@/utils/common";

interface TheBibleVerseProps extends React.HTMLAttributes<HTMLDivElement> {
  verses: {
    verse: string;
    reference: string;
  }[];
}

export default function TheBibleVerse({
  verses,
  className,
}: TheBibleVerseProps) {
  const { currentIndex, containerProps, isUserPaused, toggleUserPause } =
    useCarousel({
      count: verses.length,
      durations: 5000,
    });

  const currentVerse = verses[currentIndex];
  if (!currentVerse) return null;

  return (
    <div className="space-y-2 py-2" {...containerProps}>
      <blockquote
        className={cn(
          "relative mx-auto flex max-w-full flex-col items-center justify-center rounded-2xl border-2 border-secondary bg-surface px-6 py-3 text-primary shadow-neon transition-shadow duration-200 motion-reduce:transition-none sm:max-w-max sm:rounded-pill sm:px-12 md:px-16",
          className,
        )}
      >
        <p className="text-center font-serif text-lg font-bold text-balance break-words sm:text-xl">
          {currentVerse.verse}
        </p>
        <cite className="mt-1 block w-full text-right text-xs font-semibold text-foreground-muted not-italic">
          {currentVerse.reference}
        </cite>
      </blockquote>
      {verses.length > 1 && (
        <div className="flex justify-center">
          <CarouselPlaybackButton
            isUserPaused={isUserPaused}
            onToggle={toggleUserPause}
          />
        </div>
      )}
    </div>
  );
}
