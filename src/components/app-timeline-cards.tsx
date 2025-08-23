import AppSectionHeader from "@/components/app-section-header";
import { Media } from "@/payload-types";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface AppTimelineCardsProps {
  className?: string;
  cards: {
    title: string;
    thumbnail: Media | string;
    url?: string;
  }[];
  title: string;
}

export default function AppTimelineCards({
  className,
  cards,
  title,
}: AppTimelineCardsProps) {
  return (
    <div className={`space-y-12 ${className}`}>
      {title && (
        <AppSectionHeader className="text-2xl">{title}</AppSectionHeader>
      )}

      <div className="flex flex-col">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`flex ${
              index % 2 === 0 ? "flex-row" : "md:flex-row-reverse"
            }`}
          >
            <Link
              href={card.url || "#"}
              className={`order-last my-2 flex-1 space-y-2 rounded-lg hover:ring-2 md:order-0`}
            >
              <div className="relative aspect-video w-full">
                {typeof card.thumbnail !== "string" &&
                  typeof card.thumbnail.url === "string" && (
                    <Image
                      src={card.thumbnail.url}
                      alt={card.thumbnail.alt}
                      className="w-full rounded-lg object-cover"
                      fill
                    />
                  )}
              </div>
              <h2 className="px-2 pb-1 text-center text-xl font-semibold">
                {card.title}
              </h2>
            </Link>

            <div className="relative px-2">
              <div
                className={twMerge(
                  `bg-primary absolute top-0 right-0 left-0 mx-auto h-full w-1`,
                  index === 0 ? "rounded-t-full" : "",
                  index === cards.length - 1 ? "rounded-b-full" : "",
                )}
              ></div>
              <div className="relative mt-2 h-8 w-8 rounded-full bg-red-300">
                {typeof card.thumbnail !== "string" &&
                  typeof card.thumbnail.url === "string" && (
                    <Image
                      src={card.thumbnail.url}
                      alt={card.thumbnail.alt}
                      className="w-full rounded-lg object-cover"
                      fill
                    />
                  )}
              </div>
            </div>

            <div className="hidden flex-1 md:block"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
