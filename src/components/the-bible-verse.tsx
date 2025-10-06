"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface TheBibleVerseProps extends React.HTMLAttributes<HTMLDivElement> {
  verses: {
    verse: string;
    reference: string;
  }[];
}

export default function TheBibleVerse(props: TheBibleVerseProps) {
  const { verses, className } = props;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (verses.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === verses.length - 1 ? 0 : prevIndex + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  });

  const currentVerse = verses[currentIndex]!;
  const verse = currentVerse.verse;
  const reference = currentVerse.reference;

  return (
    <div className="py-2">
      <blockquote
        className={twMerge(
          "border-secondary text-primary shadow-neon relative mx-auto flex max-w-max flex-col items-center justify-center rounded-full border-2 bg-white px-10 pt-3 pb-2 transition-shadow md:px-20",
          className,
        )}
      >
        <p className="text-center text-xl font-bold">{verse}</p>
        <cite className="block w-full text-right text-xs font-semibold not-italic">
          {reference}
        </cite>
      </blockquote>
    </div>
  );
}
