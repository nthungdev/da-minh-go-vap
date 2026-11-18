"use client";

import { useCarousel } from "@/hooks/use-carousel";

interface TheDominicQuoteProps {
  quotes: {
    quote: string;
  }[];
}

export default function TheDominicQuote({ quotes }: TheDominicQuoteProps) {
  const { currentIndex, containerProps } = useCarousel({
    count: quotes.length,
    durations: 5000,
  });

  const currentQuote = quotes[currentIndex];
  if (!currentQuote) return null;

  return (
    <div className="h-64 md:h-32" {...containerProps}>
      <blockquote>
        <p className="text-center text-2xl font-semibold">
          {currentQuote.quote}
        </p>
      </blockquote>
    </div>
  );
}
