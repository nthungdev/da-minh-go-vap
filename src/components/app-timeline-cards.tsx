import AppSectionHeader from "@/components/app-section-header";
import { Media } from "@/payload-types";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface AppTimelineCardsProps {
  className?: string;
  cards: {
    title: string;
    thumbnail: Media;
    url: string;
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
              className={`my-2 flex-1 space-y-2 hover:ring-2 rounded-lg order-last md:order-none`}
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
              <h2 className="text-xl font-semibold px-2 pb-1 text-center">
                {card.title}
              </h2>
            </Link>

            <div className="relative px-2">
              <div
                className={twMerge(
                  `absolute left-0 right-0 top-0 h-full w-1 bg-primary mx-auto`,
                  index === 0 ? "rounded-t-full" : "",
                  index === cards.length - 1 ? "rounded-b-full" : "",
                )}
              ></div>
              <div className="relative mt-2 bg-red-300 rounded-full w-8 h-8">
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

            <div className="flex-1 hidden md:block"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
