"use client";

import { CarouselPlaybackButton } from "@/components/app-carousel";
import { useCarousel } from "@/hooks/use-carousel";

interface TheDominicQuoteProps {
  quotes: {
    quote: string;
  }[];
}

export default function TheDominicQuote({ quotes }: TheDominicQuoteProps) {
  const { currentIndex, containerProps, isUserPaused, toggleUserPause } =
    useCarousel({
      count: quotes.length,
      durations: 5000,
    });

  const currentQuote = quotes[currentIndex];
  if (!currentQuote) return null;

  return (
    <div className="min-h-32 space-y-1 py-6" {...containerProps}>
      <blockquote>
        <p className="text-center text-xl font-semibold break-words md:text-2xl">
          {currentQuote.quote}
        </p>
      </blockquote>
      {quotes.length > 1 && (
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
