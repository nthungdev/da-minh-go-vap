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
    <div className="space-y-1 py-2" {...containerProps}>
      <blockquote
        className={cn(
          "relative mx-auto flex max-w-max flex-col items-center justify-center rounded-2xl border border-secondary/35 bg-surface-warm px-6 py-4 text-primary-800 shadow-sm transition-shadow motion-reduce:transition-none md:px-12",
          className,
        )}
      >
        <p className="text-center text-xl font-bold">{currentVerse.verse}</p>
        <cite className="block w-full text-right text-xs font-semibold not-italic">
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
