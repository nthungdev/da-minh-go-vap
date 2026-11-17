"use client";

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
  const { currentIndex, containerProps } = useCarousel({
    count: verses.length,
    durations: 5000,
  });

  const currentVerse = verses[currentIndex];
  if (!currentVerse) return null;

  return (
    <div className="py-2" {...containerProps}>
      <blockquote
        className={cn(
          "border-secondary text-primary shadow-neon relative mx-auto flex max-w-max flex-col items-center justify-center rounded-full border-2 bg-white px-10 pt-3 pb-2 transition-shadow md:px-20",
          className,
        )}
      >
        <p className="text-center text-xl font-bold">{currentVerse.verse}</p>
        <cite className="block w-full text-right text-xs font-semibold not-italic">
          {currentVerse.reference}
        </cite>
      </blockquote>
    </div>
  );
}
